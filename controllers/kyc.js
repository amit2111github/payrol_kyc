const db = require("../models/index.js");
const axios = require("axios");
const { sequelize } = db;
const { models } = sequelize;
const imageUrl = "http://localhost:5000/";
const { Education, Address, AccountDetails, Kyc } = models;

exports.kyc = async (req, res) => {
  try {
    let { education, address, accountDetails, kyc, id } = req.body;
    // error checker
    if (!education || education.length == 0) {
      return res.status(400).json({ error: "Education field is empty." });
    }
    if (!address || address.length == 0) {
      return res.status(400).json({ error: "Address field is empty." });
    }
    if (!kyc) return res.status(400).json({ error: "KYC field is empty." });
    if (!accountDetails)
      return res.json({ error: "Account details is Mandatory" });
    //
    education = education.map((data) => ({ ...data, user_id: id }));
    address = address.map((data) => ({ ...data, user_id: id }));
    accountDetails.user_id = id;
    kyc.user_id = id;
    const data = await sequelize.transaction(async (t) => {
      // All 4 insetion
      education = await Education.bulkCreate(education, { transaction: t });

      accountDetails = await AccountDetails.create(accountDetails, {
        transaction: t,
      });

      kyc = await Kyc.create(kyc, { transaction: t });

      address = await Address.bulkCreate(address, { transaction: t });

      return { education, kyc, accountDetails, address };
    });

    return res.json({ data, msg: "KYC Successfully done" });
  } catch (err) {
    console.log(err);
    return res.json({ error: "Oops Fail to do KYC" });
  }
};

exports.getKycDetails = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Kyc.findOne({ where: { user_id: id } });
    if (!data) {
      return res.json({});
    }
    console.log(data);
    let urls = [
      data.dataValues.pan_proof,
      data.dataValues.aadhar_proof,
      data.dataValues.live_photo,
    ];
    url = await Promise.all(
      urls.map((cur) => {
        var config = {
          method: "post",
          url: imageUrl + "signed-url/",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({ Key: cur }),
        };

        return axios(config)
          .then((data) => data.data.url)
          .catch(function (error) {
            throw error;
          });
      })
    );

    // console.log(url);
    data.pan_proof = url[0];
    data.aadhar_proof = url[1];
    data.live_photo = url[2];
    // console.log(data);
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to get KYC Details" });
  }
};

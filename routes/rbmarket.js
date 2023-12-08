var express = require("express");
var router = express.Router();
const fs = require("fs");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

var connection = require("../config/database");

// Go to Details
router.get("/detail/:id", (req, res) => {
  connection.query(
    `SELECT * FROM rb_market WHERE id = ${req.params.id}`,
    function (err, rows) {
      if (err) {
        res.redirect("/");
      } else {
        if (rows.length > 0) {
          const sendData = {
            name: rows[0].product_name,
            price: rows[0].price_product,
            types: rows[0].product_types,
            description: rows[0].description,
            image: rows[0].image_product,
          };
          res.render("detail", { data: sendData });
        } else {
          res.send("Data not found");
        }
      }
    }
  );
});

// Get All Data
router.get("/", (req, res) => {
  var getData = "SELECT * FROM rb_market ORDER BY id desc";

  connection.query(getData, function (err, rows) {
    if (err) {
      req.flash("Error", err);
      res.render("", {
        username: req.session.username,
        role: req.session.role,
        data: "",
      });
    } else {
      res.render("rbmarket", {
        username: req.session.username,
        role: req.session.role,
        data: rows,
      });
    }
  });
});

// Get Food Data
router.get("/foods", (req, res) => {
  var getDataFood = 'SELECT * FROM rb_market WHERE product_types = "Foods"';

  connection.query(getDataFood, function (err, rows) {
    if (err) {
      req.flash("Error", err);
      res.render("", {
        username: req.session.username,
        role: req.session.role,
        data: "",
      });
    } else {
      res.render("rbmarket", {
        username: req.session.username,
        role: req.session.role,
        data: rows,
      });
    }
  });
});

// Get Drink Data
router.get("/drinks", (req, res) => {
  var getDataDrink = 'SELECT * FROM rb_market WHERE product_types = "Drinks"';

  connection.query(getDataDrink, function (err, rows) {
    if (err) {
      req.flash("Error", err);
      res.render("", {
        username: req.session.username,
        role: req.session.role,
        data: "",
      });
    } else {
      res.render("rbmarket", {
        username: req.session.username,
        role: req.session.role,
        data: rows,
      });
    }
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/create", function (req, res, next) {
  res.render("create", {
    product_name: "",
    product_types: "",
    price_product: "",
    description: "",
    image_product: "",
  });
});

// Create Data
router.post(
  "/store",
  upload.single("image_product"),
  function (req, res, next) {
    let name = req.body.product_name;
    let types = req.body.product_types;
    let price = req.body.price_product;
    let description = req.body.description;

    let image = req.file.originalname;

    let error = false;

    if (
      name.length === 0 ||
      types.length === 0 ||
      price.length === 0 ||
      description.length === 0
    ) {
      error = true;

      req.flash("error", "Please Input Correctly");
      res.render("create", {
        product_name: name,
        product_types: types,
        price_product: price,
        description: description,
        image_product: image,
      });
    }

    if (!error) {
      let formData = {
        product_name: name,
        product_types: types,
        price_product: price,
        description: description,
        image_product: image,
      };

      connection.query(
        "INSERT INTO rb_market SET ?",
        formData,
        function (err, results) {
          if (err) {
            req.flash("error", err);

            res.render("create", {
              product_name: formData.product_name,
              product_types: formData.product_types,
              price_product: formData.price_product,
              description: formData.description,
              image_product: formData.image_product,
            });
          } else {
            req.flash("Success", "Menu Data Added Successfully!");
            res.redirect("/");
          }
        }
      );
    }
  }
);

router.get("/edit/:id", function (req, res, next) {
  connection.query(
    `SELECT * FROM rb_market WHERE id = ${req.params.id}`,
    function (err, rows) {
      if (err) throw err;

      if (rows.length <= 0) {
        req.flash("error", `Menu with ID ${req.params.id} Not Found`);
        res.redirect("/");
      } else {
        res.render("edit", {
          id: rows[0].id,
          product_name: rows[0].product_name,
          product_types: rows[0].product_types,
          price_product: rows[0].price_product,
          description: rows[0].description,
          image_product: rows[0].image_product,
        });
      }
    }
  );
});

router.post(
  "/update/:id",
  upload.single("image_product"),
  function (req, res, next) {
    let name = req.body.product_name;
    let types = req.body.product_types;
    let price = req.body.price_product;
    let description = req.body.description;

    let error = false;

    if (
      name.length === 0 ||
      types.length === 0 ||
      price.length === 0 ||
      description.length === 0
    ) {
      error = true;

      // Set flash message
      req.flash("error", "Please Input Data");

      // Render to edit.ejs with flash message
      res.render("edit", {
        product_name: name,
        product_types: types,
        price_product: price,
        description: description,
      });
    }

    // If no error
    if (!error) {
      connection.query(
        // GET IMAGE FIRST
        `SELECT image_product FROM rb_market WHERE id = ${req.params.id}`,
        function (err, results) {
          if (err) {
            req.flash("error", err);
            res.render("edit", {
              product_name: name,
              product_types: types,
              price_product: price,
              description: description,
            });
          } else {
            let previousImage = results[0].image_product;

            if (previousImage) {
              fs.unlinkSync(`public/images/${previousImage}`);
            }

            let formData = {
              product_name: name,
              product_types: types,
              price_product: price,
              description: description,
            };

            if (req.file) {
              formData.image_product = req.file.originalname;
            }

            // Update query (be sure to use prepared statements or query builder)
            connection.query(
              `UPDATE rb_market SET ? WHERE id = ${req.params.id}`, formData,
              function (err) {
                if (err) {
                  req.flash("error", err);
                  res.render("edit", {
                    product_name: formData.product_name,
                    product_types: formData.product_types,
                    price_product: formData.price_product,
                    description: formData.description,
                    image_product: formData.image_product
                  });
                } else {
                  req.flash("success", "Update Data Successfully");
                  res.redirect(`/`);
                }
              }
            );
          }
        }
      );
    }
  }
);

router.get('/delete/:idData', function(req, res) {
  let idData = req.params.idData

  connection.query(`SELECT image_product FROM rb_market WHERE id = ${idData}`, function(error, results) {
    if(error) {
      req.flash('error', error);
      res.redirect(`/`);
    }else {
      let deleteImage = results[0].image_product
      if(deleteImage) fs.unlinkSync('public/images/' + deleteImage);

      connection.query(`DELETE FROM rb_market WHERE id = ${idData}`, function(error, results) {
        if(error) {
          req.flash('error', error);
          res.redirect(`/`);
        }else {
          req.flash('Success', 'Data already be deleted');
          res.redirect(`/`);
        }
      });
    }
  });
});

module.exports = router;

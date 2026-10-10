const express = require("express");
const controller = require("../controllers/resourceController");
const validateResource = require("../middleware/resourceValidation");
const validateCourse = require("../middleware/courseValidation");

const router = express.Router();

// Only whitelisted resources reach the controllers
router.param("resource", (req, res, next) =>
    validateResource(req, res, next)
);

router.get("/:resource", controller.getAll);
router.get("/:resource/:id", controller.getOne);

// Validation runs only when a course is created
const validateIfCourse = (req, res, next) =>
    req.params.resource === "courses"
        ? validateCourse(req, res, next)
        : next();

router.post("/:resource", validateIfCourse, controller.create);

router.put("/:resource/:id", controller.replace);
router.patch("/:resource/:id", controller.update);
router.delete("/:resource/:id", controller.remove);

module.exports = router;
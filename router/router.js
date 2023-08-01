
const router= require('express').Router()
const controller = require('../controller/controller');
router.post("/create_user",controller.create_user)
router.post("/create_task",controller.create_task)
router.post('/create_sub_task',controller.task_split)
router.get("/list_of_tasks",controller.my_tasks)

module.exports=router;
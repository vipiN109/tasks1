const { create_new_user, create_new_task, create_sub_task, list_of_tasks } = require("../service/service");

const create_user = async (req, res) => {
  let { user_name } = req.body;
  let response = await create_new_user(user_name);
  if (response.status) {
    return res.status(response.code).send(response);
  } else {
    return res.status(response.code).send(response);
  }
};

const create_task = async (req, res) => {
  let { userId } = req.body;
  let response = await create_new_task(userId);
  if (response.status) {
    return res.status(response.code).send(response);
  } else {
    return res.status(response.code).send(response);
  }
};

const task_split = async (req, res) => {
  let { userId, parentId, assignedby } = req.body;
  let response = await create_sub_task(userId,parentId,assignedby)
  if (response.status) {
    return res.status(response.code).send(response);
  } else {
    return res.status(response.code).send(response);
  }
};

const my_tasks = async (req, res) => {
    let { skip,limit ,userId} = req.query;
    let response = await list_of_tasks(skip,limit,userId)
    if (response.status) {
      return res.status(response.code).send(response);
    } else {
      return res.status(response.code).send(response);
    }
  };
module.exports = { create_user, create_task, task_split ,my_tasks};

const { default: mongoose } = require("mongoose");
const task_model = require("../model/task");
const user_model = require("../model/user");

const create_new_user = async (user_name) => {
  try {
    let check_user = await user_model.find({
      user_name: { $regex: user_name, $options: "i" },
    });
    if (check_user.length > 0) {
      return {
        status: false,
        code: 400,
        message: "user already exists",
      };
    }
    let newUser = new user_model({ user_name: user_name });
    newUser.save();
    return {
      status: true,
      code: 200,
      message: "user created successfully",
      userId: newUser._id,
    };
  } catch (e) {
    return {
      status: false,
      code: 404,
      message: "Something went wrong!",
    };
  }
};

const create_new_task = async (userId) => {
  try {
    let check_data = await task_model
      .find({})
      .lean()
      .sort({ _id: -1 })
      .limit(1)
    if (check_data.length > 0) {
      let document =Object.assign({},...check_data)
      let newTask = new task_model({
        task:++document.task,
        ownerId:userId
      })
      newTask.save()
      return {
        status: true,
        code: 200,
        message: "New task created successfully",
      };
    } else {
      let newTask = new task_model({
        ownerId: userId,
      });
      newTask.save();
      return {
        status: true,
        code: 200,
        message: "Task created successfully",
      };
    }
  } catch (e) {
    console.log(e)
    return {
      status: false,
      code: 400,
      message: "Something went wrong!",
    };
  }
};

const create_sub_task= async(userId,parentId,assignedby)=>{
    try {
        let check_data_exist= await task_model.find({
            "$and":[
                {
                    parentId:parentId
                },
                {
                    ownerId:userId
                },
            ]
        })

        if(check_data_exist.length>0) return {
            status:false,
            code: 400,
            message:"Sub task exist"
        }
        let last_document = await task_model
        .find({})
        .lean()
        .sort({ _id: -1 })
        .limit(1)
        let check_parentdata= await task_model.findOne({_id:parentId})
        if(!check_parentdata)  return {
            status:false,
            code: 400,
            message:"parent data not exist"
        }

        let last_document_object = Object.assign({},...last_document)
        let newSubTask= new task_model({
            ownerId:userId,
            parentId:parentId,
            assignedby:assignedby,
            task:++last_document_object.task,
        })
        newSubTask.save()
        return {
            status:true,
            code: 200,
            message: "sub task created successfully"
        }
    } catch (e) {
        console.log(e)
        return {
            status: false,
            code: 400,
            message: "Something went wrong!",
          };
    }
}
const list_of_tasks= async (skip,limit,userId)=>{
    try {
       let query=[
        {
          '$match': {
            'ownerId': new mongoose.Types.ObjectId(userId)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'ownerId', 
            'foreignField': '_id', 
            'as': 'task_owner'
          }
        }, {
          '$lookup': {
            'from': 'tasks', 
            'let': {
              'id': '$parentId', 
              'assignedBy': '$assignedby'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      '$_id', '$$id'
                    ]
                  }
                }
              }, {
                '$addFields': {
                  'assignedBy': '$$assignedBy'
                }
              }, {
                '$lookup': {
                  'from': 'users', 
                  'localField': 'ownerId', 
                  'foreignField': '_id', 
                  'as': 'task_owner'
                }
              }, {
                '$lookup': {
                  'from': 'users', 
                  'localField': 'assignedBy', 
                  'foreignField': '_id', 
                  'as': 'assignedBy'
                }
              }, {
                '$unwind': {
                  'path': '$assignedBy', 
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$unwind': '$task_owner'
              }, {
                '$project': {
                  'parentTask': '$task', 
                  'parentTaskOwner': '$task_owner.user_name', 
                  'assignedBy': {
                    '$ifNull': [
                      {
                        '$cond': {
                          'if': {
                            '$eq': [
                              '$assignedBy._id', '$task_owner._id'
                            ]
                          }, 
                          'then': 'assigned by parent owner', 
                          'else': '$assignedBy.user_name'
                        }
                      }, 'user not found'
                    ]
                  }, 
                  'parentTaskOwnerId': '$task_owner._id', 
                  'assignedById': {
                    '$ifNull': [
                      {
                        '$cond': {
                          'if': {
                            '$eq': [
                              '$assignedBy._id', '$task_owner._id'
                            ]
                          }, 
                          'then': 'assigned by parent owner', 
                          'else': '$assignedBy._id'
                        }
                      }, 'user not found'
                    ]
                  }
                }
              }
            ], 
            'as': 'sub_task_details'
          }
        }, {
          '$unwind': {
            'path': '$sub_task_details', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'task': 1, 
            'parentTask': {
              '$ifNull': [
                '$sub_task_details.parentTask', '$$REMOVE'
              ]
            }, 
            'task_owner': {
              '$arrayElemAt': [
                '$task_owner.user_name', 0
              ]
            }, 
            'parnet_owner': {
              '$ifNull': [
                '$sub_task_details.parentTaskOwner', '$$REMOVE'
              ]
            }, 
            'assignedBy': {
              '$ifNull': [
                '$sub_task_details.assignedBy', '$$REMOVE'
              ]
            }, 
            'task_owner_id': {
              '$arrayElemAt': [
                '$task_owner._id', 0
              ]
            }
          }
        },
        {
            "$sort":{
                _id:-1
            }
        }
      ]
       let list_of_task= await task_model.aggregate([
        ...query,
        {
            "$skip":parseInt(skip),
        },
        {
            "$limit":parseInt(limit)
        }
       ])   
       let count= await task_model.aggregate([
        ...query,
        {
            '$count':'count'
        }
       ])
       return {
        status:true,
        code:200,
        message:"list fetched successfully",
        list_of_task,
        total_documents:count.length>0? count[0].count:0
       }  
    } catch (e) {
        console.log(e)
        return {
            status:false,
            code:400,
            message:"Something went wrong!"
           }  
    }
}


module.exports = {
  create_new_user,
  create_sub_task,
  create_new_task,
  list_of_tasks
};

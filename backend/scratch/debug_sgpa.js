const mongoose = require('mongoose');
require('dotenv').config({path:'./.env'});

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const id = '26EEE001';
    
    const pipeline = [
        { $match: { student_id: id } },
        {
          $addFields: {
            m_code: { $trim: { input: { $toUpper: "$course_code" } } },
            m_sem: { $trim: { input: { $toUpper: "$semester" } } }
          }
        },
        {
          $lookup: {
            from: 'department_course',
            let: { markCode: "$m_code" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $trim: { input: { $toUpper: "$code" } } }, "$$markCode"]
                  }
                }
              }
            ],
            as: 'course_info'
          }
        },
        { $unwind: { path: '$course_info', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { semester: "$m_sem", course_code: "$m_code" },
            course_type: { $first: "$course_info.type" },
            marks: { $push: { type: { $trim: { input: { $toUpper: "$exam_type" } } }, val: { $toDouble: "$mark" } } }
          }
        },
        {
          $project: {
            semester: "$_id.semester",
            course_code: "$_id.course_code",
            hasSem: { $gt: [{ $size: { $filter: { input: "$marks", as: "m", cond: { $eq: ["$$m.type", "SEMESTER"] } } } }, 0] },
            sem_marks: { $filter: { input: "$marks", as: "m", cond: { $eq: ["$$m.type", "SEMESTER"] } } }
          }
        }
    ];

    const results = await mongoose.connection.db.collection('marks').aggregate(pipeline).toArray();
    console.log(JSON.stringify(results, null, 2));
    process.exit();
}

debug();

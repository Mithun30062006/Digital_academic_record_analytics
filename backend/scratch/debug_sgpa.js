const mongoose = require('mongoose');
require('dotenv').config({path:'./.env'});

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const id = '26EEE001';
    
    const pipeline = [
        { $match: { student_id: id } },
        { $addFields: { u_exam: { $trim: { input: { $toUpper: "$exam_type" } } } } },
        { $group: {
            _id: { sem: { $trim: { input: { $toUpper: "$semester" } } }, code: { $trim: { input: { $toUpper: "$course_code" } } } },
            h1: { $max: { $cond: [{ $eq: ["$u_exam", "HALF 1"] }, { $toDouble: "$mark" }, 0] } },
            h2: { $max: { $cond: [{ $eq: ["$u_exam", "HALF 2"] }, { $toDouble: "$mark" }, 0] } },
            mod: { $max: { $cond: [{ $eq: ["$u_exam", "MODEL"] }, { $toDouble: "$mark" }, 0] } },
            sem: { $max: { $cond: [{ $eq: ["$u_exam", "SEMESTER"] }, { $toDouble: "$mark" }, 0] } },
            hasSem: { $max: { $cond: [{ $eq: ["$u_exam", "SEMESTER"] }, 1, 0] } }
        }},
        { $lookup: {
            from: "department_course",
            let: { c: "$_id.code" },
            pipeline: [{ $match: { $expr: { $eq: [{ $trim: { input: { $toUpper: "$code" } } }, "$$c"] } } }],
            as: "info"
        }},
        { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
        { $project: {
            semester: "$_id.sem",
            credits: { $toDouble: { $ifNull: ["$info.credit", { $ifNull: ["$info.credits", 3] }] } },
            fMark: {
              $cond: [
                { $or: [{ $gt: ["$mod", 0] }, { $ne: [{ $indexOfCP: [{ $toUpper: { $ifNull: ["$info.type", ""] } }, "LAB"] }, -1] }] },
                { $round: [{ $add: [{ $multiply: [{ $divide: [{ $add: ["$h1", "$h2"] }, 2] }, 0.3] }, { $multiply: ["$mod", 0.1] }, { $multiply: ["$sem", 0.6] }] }, 0] },
                { $round: [{ $add: [{ $multiply: [{ $divide: [{ $add: ["$h1", "$h2"] }, 2] }, 0.4] }, { $multiply: ["$sem", 0.6] }] }, 0] }
              ]
            },
            passed: { $eq: ["$hasSem", 1] }
        }},
        { $project: {
            semester: 1, credits: 1, passed: 1,
            gp: { $cond: [ "$passed", {
              $switch: { branches: [
                { case: { $gte: ["$fMark", 91] }, then: 10 }, { case: { $gte: ["$fMark", 81] }, then: 9 },
                { case: { $gte: ["$fMark", 71] }, then: 8 }, { case: { $gte: ["$fMark", 61] }, then: 7 },
                { case: { $gte: ["$fMark", 51] }, then: 6 }, { case: { $gte: ["$fMark", 50] }, then: 5 }
              ], default: 0 }
            }, 0 ] }
        }},
        { $group: {
            _id: "$semester",
            pts: { $sum: { $multiply: ["$gp", "$credits"] } },
            creds: { $sum: { $cond: ["$passed", "$credits", 0] } }
        }},
        { $project: { semester: "$_id", sgpa: { $cond: [{ $eq: ["$creds", 0] }, 0, { $round: [{ $divide: ["$pts", "$creds"] }, 2] }] } } }
    ];

    const results = await mongoose.connection.db.collection('marks').aggregate(pipeline).toArray();
    console.log(JSON.stringify(results, null, 2));
    process.exit();
}

debug();

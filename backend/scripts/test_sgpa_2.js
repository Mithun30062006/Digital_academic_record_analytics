const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Mark = require('../models/Mark');

async function testAggregation() {
    try {
        const mongoUrl = process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);
        console.log('Connected');

        const studentId = "26EEE001";
        console.log('Testing aggregation for student_id:', studentId);

        const fullResults = await Mark.model.aggregate([
            { $match: { student_id: studentId } },
            {
                $lookup: {
                    from: 'department_course',
                    localField: 'course_code',
                    foreignField: 'code',
                    as: 'course_details'
                }
            },
            { $unwind: { path: '$course_details', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { semester: "$semester", course_code: "$course_code" },
                    course_type: { $first: { $ifNull: ["$course_details.type", "Theory"] } },
                    credits: { $first: { $ifNull: ["$course_details.credit", 0] } },
                    marks: { $push: { type: "$exam_type", val: "$mark" } }
                }
            },
            {
                $project: {
                    semester: "$_id.semester",
                    course_code: "$_id.course_code",
                    credits: 1,
                    course_type: 1,
                    half1: { $arrayElemAt: [{ $filter: { input: "$marks", as: "m", cond: { $eq: ["$$m.type", "Half 1"] } } }, 0] },
                    half2: { $arrayElemAt: [{ $filter: { input: "$marks", as: "m", cond: { $eq: ["$$m.type", "Half 2"] } } }, 0] },
                    model: { $arrayElemAt: [{ $filter: { input: "$marks", as: "m", cond: { $eq: ["$$m.type", "Model"] } } }, 0] },
                    semester_mark: { $arrayElemAt: [{ $filter: { input: "$marks", as: "m", cond: { $eq: ["$$m.type", "Semester"] } } }, 0] }
                }
            },
            {
                $project: {
                    semester: 1,
                    credits: 1,
                    h1: { $ifNull: ["$half1.val", 0] },
                    h2: { $ifNull: ["$half2.val", 0] },
                    mod: { $ifNull: ["$model.val", 0] },
                    sem: { $ifNull: ["$semester_mark.val", 0] },
                    isLab: { $eq: ["$course_type", "Theory with Lab"] }
                }
            },
            {
                $project: {
                    semester: 1,
                    credits: 1,
                    internal: {
                        $cond: [
                            "$isLab",
                            { $divide: [{ $add: [{ $max: ["$h1", "$h2"] }, "$mod"] }, 2] },
                            { $divide: [{ $add: ["$h1", "$h2"] }, 2] }
                        ]
                    },
                    sem: 1
                }
            },
            {
                $project: {
                    semester: 1,
                    credits: 1,
                    finalMark: { $add: [{ $multiply: ["$internal", 0.4] }, { $multiply: ["$sem", 0.6] }] }
                }
            },
            {
                $project: {
                    semester: 1,
                    credits: 1,
                    finalMark: 1,
                    gradePoint: {
                        $switch: {
                            branches: [
                                { case: { $gte: ["$finalMark", 91] }, then: 10 },
                                { case: { $gte: ["$finalMark", 81] }, then: 9 },
                                { case: { $gte: ["$finalMark", 71] }, then: 8 },
                                { case: { $gte: ["$finalMark", 61] }, then: 7 },
                                { case: { $gte: ["$finalMark", 51] }, then: 6 },
                                { case: { $eq: ["$finalMark", 50] }, then: 5 }
                            ],
                            default: 0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$semester",
                    subjects: { $push: "$$ROOT" },
                    totalPoints: { $sum: { $multiply: ["$gradePoint", "$credits"] } },
                    totalCredits: { $sum: "$credits" }
                }
            },
            {
                $project: {
                    semester: "$_id",
                    subjects: 1,
                    sgpa: {
                        $cond: [{ $eq: ["$totalCredits", 0] }, 0, { $round: [{ $divide: ["$totalPoints", "$totalCredits"] }, 2] }]
                    }
                }
            }
        ]);
        console.log('Final calculation result:', JSON.stringify(fullResults, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

testAggregation();

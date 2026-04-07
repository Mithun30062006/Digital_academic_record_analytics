const semesters = [
    { id: 1, numeric: 'I', title: 'Semester 1' },
    { id: 2, numeric: 'II', title: 'Semester 2' },
    { id: 3, numeric: 'III', title: 'Semester 3' },
    { id: 4, numeric: 'IV', title: 'Semester 4' },
    { id: 5, numeric: 'V', title: 'Semester 5' },
    { id: 6, numeric: 'VI', title: 'Semester 6' },
    { id: 7, numeric: 'VII', title: 'Semester 7' },
    { id: 8, numeric: 'VIII', title: 'Semester 8' }
];

exports.getSemesters = (req, res) => {
    try {
        res.json(semesters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch semesters' });
    }
};

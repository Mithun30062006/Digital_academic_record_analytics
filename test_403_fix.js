const API_URL = 'http://localhost:3000/api';

async function testFix() {
    console.log('--- Starting verification of 403 Forbidden fix and Security Gap ---');
    
    try {
        console.log('\n[Phase 1] Testing Student Access Restricted...');
        
        // Find a student
        const studentRes = await fetch(`${API_URL}/students/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_number: '2023CSE001', // Assuming this exists from previous context
                password: 'password123'
            })
        }).catch(e => ({ status: 0, error: e.message }));

        if (studentRes.ok) {
            const data = await studentRes.json();
            const studentToken = data.token;
            const headers = { 'Authorization': `Bearer ${studentToken}` };

            // Try to access admin-only student filter
            const filterRes = await fetch(`${API_URL}/students/filter?department=cse&year=I`, { headers });
            console.log(`Student accessing /students/filter: Status ${filterRes.status} (Expected 403)`);

            // Try to access special-actions (now protected)
            const specialRes = await fetch(`${API_URL}/special-actions?year=I`, { headers });
            console.log(`Student accessing /special-actions: Status ${specialRes.status} (Expected 403)`);
        } else {
            console.log(`Skipping student phase: Status ${studentRes.status || 'Error'}`);
        }

        console.log('\n[Phase 2] Testing Admin Access Permitted...');
        
        // Login as admin
        const adminRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'adminpassword'
            })
        }).catch(e => ({ status: 0, error: e.message }));

        if (adminRes.ok) {
            const data = await adminRes.json();
            const adminToken = data.token;
            const headers = { 'Authorization': `Bearer ${adminToken}` };

            // Access student filter
            const filterRes = await fetch(`${API_URL}/students/filter?department=cse&year=I`, { headers });
            console.log(`Admin accessing /students/filter: Status ${filterRes.status} (Expected 200)`);

            // Access special-actions
            const specialRes = await fetch(`${API_URL}/special-actions?year=I`, { headers });
            console.log(`Admin accessing /special-actions: Status ${specialRes.status} (Expected 200/400/404)`);
        } else {
            console.log(`Skipping admin phase: Status ${adminRes.status || 'Error'}. Please check if server is running.`);
        }

    } catch (error) {
        console.error('Test script error:', error.message);
    }
}

testFix();

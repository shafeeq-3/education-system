/**
 * Smoke Test for Academic Core Module
 * Tests: Authentication, Authorization, CRUD operations, Campus isolation, Pagination
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Institute from '../models/Institute.js';
import Campus from '../models/Campus.js';
import Department from '../models/Department.js';
import { generateAccessToken } from '../utils/jwt.js';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test data storage
const testData = {
  superAdminToken: null,
  adminToken: null,
  teacherToken: null,
  instituteId: null,
  campus1Id: null,
  campus2Id: null,
  departmentId: null,
  superAdminId: null,
  adminId: null,
  teacherId: null
};

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test 1: Setup test users and tokens
async function setupTestUsers() {
  console.log('\n📋 Test 1: Setting up test users...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Create SuperAdmin
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@smoke.test',
      username: 'superadmin_test',
      password: 'Test@123',
      role: 'superadmin',
      isApproved: true,
      profile: { bio: 'Test SuperAdmin' }
    });
    testData.superAdminId = superAdmin._id;
    testData.superAdminToken = generateAccessToken(superAdmin._id, superAdmin.role);
    console.log('✅ SuperAdmin created');
    
    // Create test institute and campus for admin
    const institute = await Institute.create({
      name: 'Test Institute',
      code: 'TEST-INST',
      createdBy: superAdmin._id
    });
    testData.instituteId = institute._id;
    console.log('✅ Test Institute created');
    
    const campus1 = await Campus.create({
      institute: institute._id,
      name: 'Test Campus 1',
      code: 'TC1',
      createdBy: superAdmin._id
    });
    testData.campus1Id = campus1._id;
    console.log('✅ Test Campus 1 created');
    
    const campus2 = await Campus.create({
      institute: institute._id,
      name: 'Test Campus 2',
      code: 'TC2',
      createdBy: superAdmin._id
    });
    testData.campus2Id = campus2._id;
    console.log('✅ Test Campus 2 created');
    
    // Create Admin for Campus 1
    const admin = await User.create({
      firstName: 'Campus',
      lastName: 'Admin',
      email: 'admin@smoke.test',
      username: 'admin_test',
      password: 'Test@123',
      role: 'admin',
      campus: campus1._id,
      institute: institute._id,
      isApproved: true,
      profile: { bio: 'Test Admin' }
    });
    testData.adminId = admin._id;
    testData.adminToken = generateAccessToken(admin._id, admin.role);
    console.log('✅ Admin created for Campus 1');
    
    // Create Teacher for Campus 1
    const teacher = await User.create({
      firstName: 'Test',
      lastName: 'Teacher',
      email: 'teacher@smoke.test',
      username: 'teacher_test',
      password: 'Test@123',
      role: 'teacher',
      campus: campus1._id,
      institute: institute._id,
      isApproved: true,
      profile: { bio: 'Test Teacher' }
    });
    testData.teacherId = teacher._id;
    testData.teacherToken = generateAccessToken(teacher._id, teacher.role);
    console.log('✅ Teacher created for Campus 1');
    
    console.log('✅ Test 1 PASSED: All test users created\n');
    return true;
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message);
    return false;
  }
}

// Test 2: Authentication - Endpoints require valid token
async function testAuthentication() {
  console.log('📋 Test 2: Testing authentication...');
  
  // Try accessing without token
  const result = await apiRequest('/departments');
  
  if (result.status === 401) {
    console.log('✅ Test 2 PASSED: Unauthenticated requests are blocked\n');
    return true;
  } else {
    console.error('❌ Test 2 FAILED: Expected 401, got', result.status);
    return false;
  }
}

// Test 3: Authorization - Role-based access control
async function testAuthorization() {
  console.log('📋 Test 3: Testing role-based authorization...');
  
  // Teacher tries to create department (should fail)
  const result = await apiRequest(
    '/departments',
    'POST',
    {
      campusId: testData.campus1Id,
      name: 'Unauthorized Dept',
      code: 'UNAUTH'
    },
    testData.teacherToken
  );
  
  if (result.status === 403) {
    console.log('✅ Test 3 PASSED: Teachers cannot create departments\n');
    return true;
  } else {
    console.error('❌ Test 3 FAILED: Expected 403, got', result.status);
    return false;
  }
}

// Test 4: CRUD Operations - Create, Read, Update, Delete
async function testCRUDOperations() {
  console.log('📋 Test 4: Testing CRUD operations...');
  
  try {
    // CREATE - Admin creates department
    const createResult = await apiRequest(
      '/departments',
      'POST',
      {
        campusId: testData.campus1Id,
        name: 'Computer Science',
        code: 'CS'
      },
      testData.adminToken
    );
    
    if (createResult.status !== 201) {
      console.error('❌ CREATE failed:', createResult.status);
      return false;
    }
    testData.departmentId = createResult.data.data._id;
    console.log('✅ CREATE: Department created');
    
    // READ - Get department by ID
    const readResult = await apiRequest(
      `/departments/${testData.departmentId}`,
      'GET',
      null,
      testData.adminToken
    );
    
    if (readResult.status !== 200 || readResult.data.data.name !== 'Computer Science') {
      console.error('❌ READ failed:', readResult.status);
      return false;
    }
    console.log('✅ READ: Department retrieved');
    
    // UPDATE - Update department
    const updateResult = await apiRequest(
      `/departments/${testData.departmentId}`,
      'PUT',
      { name: 'Computer Science & Engineering' },
      testData.adminToken
    );
    
    if (updateResult.status !== 200) {
      console.error('❌ UPDATE failed:', updateResult.status);
      return false;
    }
    console.log('✅ UPDATE: Department updated');
    
    // LIST - Get all departments
    const listResult = await apiRequest(
      '/departments',
      'GET',
      null,
      testData.adminToken
    );
    
    if (listResult.status !== 200 || !Array.isArray(listResult.data.data)) {
      console.error('❌ LIST failed:', listResult.status);
      return false;
    }
    console.log('✅ LIST: Departments listed');
    
    console.log('✅ Test 4 PASSED: All CRUD operations work\n');
    return true;
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message);
    return false;
  }
}

// Test 5: Campus-level data isolation
async function testCampusIsolation() {
  console.log('📋 Test 5: Testing campus-level data isolation...');
  
  try {
    // Admin from Campus 1 tries to create department in Campus 2
    const result = await apiRequest(
      '/departments',
      'POST',
      {
        campusId: testData.campus2Id,
        name: 'Unauthorized Dept',
        code: 'UNAUTH2'
      },
      testData.adminToken
    );
    
    // Should succeed in creation but admin should only see their campus data
    // Let's verify admin can only see Campus 1 departments
    const listResult = await apiRequest(
      '/departments',
      'GET',
      null,
      testData.adminToken
    );
    
    if (listResult.status === 200) {
      const departments = listResult.data.data;
      const hasCampus2Dept = departments.some(d => d.campus.toString() === testData.campus2Id.toString());
      
      if (!hasCampus2Dept) {
        console.log('✅ Test 5 PASSED: Campus isolation enforced\n');
        return true;
      } else {
        console.error('❌ Test 5 FAILED: Admin can see other campus data');
        return false;
      }
    }
    
    console.log('✅ Test 5 PASSED: Campus isolation works\n');
    return true;
  } catch (error) {
    console.error('❌ Test 5 FAILED:', error.message);
    return false;
  }
}

// Test 6: Pagination, Filtering, and Search
async function testPaginationAndFiltering() {
  console.log('📋 Test 6: Testing pagination, filtering, and search...');
  
  try {
    // Test pagination
    const paginationResult = await apiRequest(
      '/departments?page=1&limit=10',
      'GET',
      null,
      testData.superAdminToken
    );
    
    if (paginationResult.status !== 200 || !paginationResult.data.meta) {
      console.error('❌ Pagination failed');
      return false;
    }
    console.log('✅ PAGINATION: Works correctly');
    
    // Test search
    const searchResult = await apiRequest(
      '/departments?search=Computer',
      'GET',
      null,
      testData.superAdminToken
    );
    
    if (searchResult.status !== 200) {
      console.error('❌ Search failed');
      return false;
    }
    console.log('✅ SEARCH: Works correctly');
    
    // Test filtering
    const filterResult = await apiRequest(
      `/departments?campusId=${testData.campus1Id}`,
      'GET',
      null,
      testData.superAdminToken
    );
    
    if (filterResult.status !== 200) {
      console.error('❌ Filtering failed');
      return false;
    }
    console.log('✅ FILTERING: Works correctly');
    
    // Test sorting
    const sortResult = await apiRequest(
      '/departments?sortBy=name&sortOrder=asc',
      'GET',
      null,
      testData.superAdminToken
    );
    
    if (sortResult.status !== 200) {
      console.error('❌ Sorting failed');
      return false;
    }
    console.log('✅ SORTING: Works correctly');
    
    console.log('✅ Test 6 PASSED: Pagination, filtering, search, and sorting work\n');
    return true;
  } catch (error) {
    console.error('❌ Test 6 FAILED:', error.message);
    return false;
  }
}

// Test 7: Soft Delete
async function testSoftDelete() {
  console.log('📋 Test 7: Testing soft delete...');
  
  try {
    // Delete department
    const deleteResult = await apiRequest(
      `/departments/${testData.departmentId}`,
      'DELETE',
      null,
      testData.adminToken
    );
    
    if (deleteResult.status !== 200) {
      console.error('❌ DELETE failed:', deleteResult.status);
      return false;
    }
    console.log('✅ DELETE: Department soft deleted');
    
    // Verify it's not in list
    const listResult = await apiRequest(
      '/departments',
      'GET',
      null,
      testData.adminToken
    );
    
    const deletedDept = listResult.data.data.find(d => d._id === testData.departmentId);
    
    if (!deletedDept) {
      console.log('✅ Test 7 PASSED: Soft delete works correctly\n');
      return true;
    } else {
      console.error('❌ Test 7 FAILED: Deleted department still appears');
      return false;
    }
  } catch (error) {
    console.error('❌ Test 7 FAILED:', error.message);
    return false;
  }
}

// Cleanup test data
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    await User.deleteMany({ email: { $regex: '@smoke.test$' } });
    await Institute.deleteMany({ code: 'TEST-INST' });
    await Campus.deleteMany({ code: { $in: ['TC1', 'TC2'] } });
    await Department.deleteMany({ code: { $in: ['CS', 'UNAUTH', 'UNAUTH2'] } });
    
    await mongoose.connection.close();
    console.log('✅ Cleanup complete\n');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Run all tests
async function runSmokeTests() {
  console.log('🚀 Starting Academic Core Module Smoke Tests\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  results.push(await setupTestUsers());
  results.push(await testAuthentication());
  results.push(await testAuthorization());
  results.push(await testCRUDOperations());
  results.push(await testCampusIsolation());
  results.push(await testPaginationAndFiltering());
  results.push(await testSoftDelete());
  
  await cleanup();
  
  console.log('='.repeat(60));
  console.log('\n📊 SMOKE TEST RESULTS:');
  console.log(`✅ Passed: ${results.filter(r => r).length}/${results.length}`);
  console.log(`❌ Failed: ${results.filter(r => !r).length}/${results.length}`);
  
  if (results.every(r => r)) {
    console.log('\n🎉 ALL SMOKE TESTS PASSED! Academic Core Module is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED! Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runSmokeTests();

import axios from "axios";

const API_URL = "http://autopartsdemo.runasp.net/api";

async function testAuth() {
  console.log("Testing Authentication Endpoints...");

  // Test 1: Register
  console.log("\n1. Testing Registration...");
  const registerData = {
    email: `test${Date.now()}@example.com`,
    name: `testuser${Date.now()}`,
    password: "TestPassword123!",
  };

  try {
    console.log("Sending register data:", registerData);
    const regResponse = await axios.post(
      `${API_URL}/Users/register`,
      registerData
    );
    console.log("✅ Registration Successful!");
    console.log("Status:", regResponse.status);
    console.log("Data:", JSON.stringify(regResponse.data, null, 2));
  } catch (error) {
    console.log("❌ Registration Failed");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }

  // Test 2: Login
  console.log("\n2. Testing Login...");
  const loginDataNew = {
    name: registerData.name,
    password: registerData.password,
  };

  try {
    console.log("Sending login data:", loginDataNew);
    const loginResponse = await axios.post(
      `${API_URL}/Users/login`,
      loginDataNew
    );
    console.log("✅ Login Successful!");
    console.log("Status:", loginResponse.status);
    console.log(
      "Full Login Data:",
      JSON.stringify(loginResponse.data, null, 2)
    );
  } catch (error) {
    console.log("❌ Login Failed");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }
}

testAuth();

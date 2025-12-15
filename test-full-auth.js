import axios from "axios";

const API_URL = "http://autopartsdemo.runasp.net/api";

async function testCompleteAuth() {
  console.log("🧪 TESTING COMPLETE AUTHENTICATION FLOW");
  console.log("=========================================\n");

  const timestamp = Date.now();
  const testUser = {
    email: `test${timestamp}@example.com`,
    name: `user${timestamp}`,
    password: "TestPassword123!",
  };

  try {
    // 1. Register
    console.log("1️⃣  REGISTRATION");
    console.log("Payload:", testUser);

    const registerRes = await axios.post(`${API_URL}/Users/register`, {
      email: testUser.email,
      name: testUser.name,
      password: testUser.password,
    });

    console.log("✅ Registration successful");
    console.log("Response:", registerRes.data);
    console.log("---\n");

    // 2. Login with registered user
    console.log("2️⃣  LOGIN");
    console.log("Credentials:", {
      name: testUser.name,
      password: testUser.password,
    });

    const loginRes = await axios.post(`${API_URL}/Users/login`, {
      name: testUser.name,
      password: testUser.password,
    });

    const token = loginRes.data.token;
    console.log("✅ Login successful");
    console.log(
      "Token received:",
      token ? `${token.substring(0, 50)}...` : "NO TOKEN!"
    );
    console.log("Full response:", loginRes.data);
    console.log("---\n");

    // 3. Fetch user with token
    console.log("3️⃣  FETCH CURRENT USER");
    console.log("Using token in Authorization header");

    const userRes = await axios.get(`${API_URL}/Users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ User data fetched");
    console.log("User data:", userRes.data);
    console.log("---\n");

    console.log("✅✅✅ COMPLETE AUTH FLOW WORKS! ✅✅✅");
    console.log("\nYou can now login in the app with:");
    console.log(`Username: ${testUser.name}`);
    console.log(`Password: ${testUser.password}`);
  } catch (error) {
    console.error("❌ ERROR:", error.response?.data || error.message);
    process.exit(1);
  }
}

testCompleteAuth();

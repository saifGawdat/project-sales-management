import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const API_URL =
  process.env.VITE_API_BASE_URL || "http://autopartsdemo.runasp.net/api";

async function verifyAuthFlow() {
  console.log("🚀 Starting Authentication Flow Verification...");
  console.log(`📡 API URL: ${API_URL}`);

  const timestamp = Date.now();
  const testUser = {
    email: `flow${timestamp}@test.com`,
    username: `user${timestamp}`,
    password: "TestPassword123!",
  };

  try {
    // 1. Register
    console.log("\n1️⃣  Registering new user...");
    console.log(`   User: ${testUser.username}, Email: ${testUser.email}`);

    // Note: The API requires email, name (as username), and password
    await axios.post(`${API_URL}/Users/register`, {
      email: testUser.email,
      name: testUser.username,
      password: testUser.password,
    });
    console.log("   ✅ Registration successful");

    // 2. Login
    console.log("\n2️⃣  Logging in...");
    const loginResponse = await axios.post(`${API_URL}/Users/login`, {
      name: testUser.username,
      password: testUser.password,
    });

    const token = loginResponse.data.token;
    if (!token) throw new Error("No token received from login");
    console.log("   ✅ Login successful, Token received");

    // 3. Get User Details
    console.log("\n3️⃣  Fetching User Details...");
    const userResponse = await axios.get(`${API_URL}/Users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("   ✅ User details fetched successfully");
    console.log("   👤 User Data:", {
      id: userResponse.data.id,
      name: userResponse.data.name,
      email: userResponse.data.email,
    });

    if (
      userResponse.data.name === testUser.username &&
      userResponse.data.email === testUser.email
    ) {
      console.log(
        "\n✅✅✅ FULL AUTHENTICATION FLOW VERIFIED SUCCESSFULLY! ✅✅✅"
      );
    } else {
      console.error(
        "\n⚠️ Data mismatch: User details do not match registration data"
      );
    }
  } catch (error) {
    console.error("\n❌ Verification Failed:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("   Error:", error.message);
    }
    process.exit(1);
  }
}

verifyAuthFlow();

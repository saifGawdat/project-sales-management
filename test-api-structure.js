// Test API responses to check data structure
import axios from "axios";

const API_BASE_URL = "http://autopartsdemo.runasp.net/api";

async function testAPI() {
  console.log("Testing API Response Structures...\n");

  try {
    // Test Categories endpoint
    console.log("1. Testing GET /Categories");
    const categoriesRes = await axios.get(`${API_BASE_URL}/Categories`);
    console.log("Status:", categoriesRes.status);
    console.log("Response structure:", Object.keys(categoriesRes));
    console.log(
      "Data type:",
      Array.isArray(categoriesRes.data) ? "Array" : typeof categoriesRes.data
    );
    console.log("First item:", categoriesRes.data?.[0]);
    console.log(
      "Full response data:",
      JSON.stringify(categoriesRes.data, null, 2)
    );
    console.log("\n---\n");

    // Test ProductTypes endpoint
    console.log("2. Testing GET /ProductTypes");
    const productTypesRes = await axios.get(`${API_BASE_URL}/ProductTypes`);
    console.log("Status:", productTypesRes.status);
    console.log(
      "Data type:",
      Array.isArray(productTypesRes.data)
        ? "Array"
        : typeof productTypesRes.data
    );
    console.log("First item:", productTypesRes.data?.[0]);
    console.log("\n---\n");

    // Test Products endpoint
    console.log("3. Testing GET /Products");
    const productsRes = await axios.get(`${API_BASE_URL}/Products`);
    console.log("Status:", productsRes.status);
    console.log(
      "Data type:",
      Array.isArray(productsRes.data) ? "Array" : typeof productsRes.data
    );
    console.log("First item:", productsRes.data?.[0]);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testAPI();

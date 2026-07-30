import { jwtVerify } from 'jose';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.f5Jfj7BBsXq3Q4DRY-YS3FXphMYGmHLjIAaTqJ_Reh4";
const SECRET_KEY = new TextEncoder().encode('super_secret_jwt_key_here');

async function run() {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log('Success:', payload);
  } catch (e) {
    console.error('Failed:', e.message);
  }
}
run();

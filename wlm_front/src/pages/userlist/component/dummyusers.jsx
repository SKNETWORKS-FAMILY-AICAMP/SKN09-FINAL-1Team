const dummyUsers = Array.from({ length: 300 }, (_, i) => {
  const deptCodes = ['10', '20', '30'];
  const departments = ['개발팀', '인사팀', '영업팀'];

  const deptIndex = i % 3;
  const deptCode = deptCodes[deptIndex];
  const department = departments[deptIndex];
  const serial = String(i + 1).padStart(3, '0'); // 001, 002, ...

  return {
    name: `사용자${i + 1}`,
    birth: '1990-01-01',
    id: `emp${deptCode}${serial}`, // ex. emp010001
    email: `user${i + 1}@example.com`,
    department,
    password: '••••••',
  };
});



export default dummyUsers;

// Simple local storage implementation for testing without MongoDB
let mockData = {};

export const mockDatabase = {
  async findOne({ username }) {
    return mockData[username] || null;
  },
  
  async insertOne(data) {
    mockData[data.username] = data;
    return { acknowledged: true };
  },
  
  async updateOne({ username }, updateOperations) {
    if (mockData[username]) {
      // Handle $set operations
      if (updateOperations.$set) {
        Object.keys(updateOperations.$set).forEach(key => {
          if (key.includes('.')) {
            // Handle nested keys like "history.2025-07-20.EC502"
            const parts = key.split('.');
            let obj = mockData[username];
            for (let i = 0; i < parts.length - 1; i++) {
              if (!obj[parts[i]]) obj[parts[i]] = {};
              obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = updateOperations.$set[key];
          } else {
            mockData[username][key] = updateOperations.$set[key];
          }
        });
      }
      
      // Handle $unset operations
      if (updateOperations.$unset) {
        Object.keys(updateOperations.$unset).forEach(key => {
          if (key.includes('.')) {
            // Handle nested keys like "weeklyReports.week-1-2025-07-21"
            const parts = key.split('.');
            let obj = mockData[username];
            for (let i = 0; i < parts.length - 1; i++) {
              if (!obj[parts[i]]) return; // Path doesn't exist
              obj = obj[parts[i]];
            }
            delete obj[parts[parts.length - 1]];
          } else {
            delete mockData[username][key];
          }
        });
      }
    }
    return { acknowledged: true };
  }
};

export const clearMockData = () => {
  mockData = {};
};

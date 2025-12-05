
describe('Simple Tests', () => {
  test('Basic math should work', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 2).toBe(4);
  });
  
  test('Objects should work', () => {
    const user = { id: 1, name: 'Test' };
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user.name).toBe('Test');
  });
  
  test('Arrays should work', () => {
    const orders = [
      { id: 1, total: 100 },
      { id: 2, total: 200 }
    ];
    expect(orders).toHaveLength(2);
    expect(orders[0].total).toBe(100);
  });
});
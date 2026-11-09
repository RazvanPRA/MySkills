import { shapeRows } from '../executor';
import { opSqliteExecutor } from '../opSqliteExecutor';

describe('shapeRows (sqlite-proxy contract)', () => {
  const rows = [
    [1, 'a'],
    [2, 'b'],
  ];

  it('returns all rows for all/values, nothing for run, the first row for get', () => {
    expect(shapeRows(rows, 'all')).toEqual({ rows });
    expect(shapeRows(rows, 'values')).toEqual({ rows });
    expect(shapeRows(rows, 'run')).toEqual({ rows: [] });
    expect(shapeRows(rows, 'get')).toEqual({ rows: [1, 'a'] });
  });

  it('returns undefined rows for get when nothing matched', () => {
    expect(shapeRows([], 'get')).toEqual({ rows: undefined });
  });
});

describe('opSqliteExecutor', () => {
  const fakeDb = () => ({
    execute: jest.fn().mockResolvedValue({ rows: [], rowsAffected: 1 }),
    executeRaw: jest
      .fn()
      .mockResolvedValue({ rawRows: [[1, 'a']], rowsAffected: 0, columnNames: [] }),
  });

  it('uses execute for writes', async () => {
    const db = fakeDb();
    const result = await opSqliteExecutor(db)('insert into t values (?)', [1], 'run');
    expect(db.execute).toHaveBeenCalledWith('insert into t values (?)', [1]);
    expect(result).toEqual({ rows: [] });
  });

  it('uses executeRaw for reads and unwraps rawRows', async () => {
    const db = fakeDb();
    expect(await opSqliteExecutor(db)('select * from t', [], 'all')).toEqual({ rows: [[1, 'a']] });
    expect(await opSqliteExecutor(db)('select * from t', [], 'get')).toEqual({ rows: [1, 'a'] });
  });
});

import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Button } from '../components/Button';
import { AppLoader } from '../components/Loader';
import { Table, TableCell, TableLine } from '../components/Table';
import { Text } from '../components/Text';

type HighScoreItem = {
  playerName: string;
  highScore: number;
  updatedAt: string;
};

type HighScoresResponse = {
  items: HighScoreItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const PAGE_SIZE = 10;

export const HighScores = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HighScoresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHighScores(p, PAGE_SIZE);
      const json = (await res.json()) as HighScoresResponse & { error?: string };
      if (!res.ok) {
        setError(json.error ?? 'Failed to load');
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setError('Network error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  const totalPages = data?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div>
      <div style={{ padding: '10px 20px' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'white', textDecoration: 'none' }}
        >
          <ArrowLeft size={20} /> Back
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-center text-blue-500 py-2">High scores</h1>

      {loading && !data && (
        <Text style={{ padding: '40px 0' }}>
          <AppLoader />
        </Text>
      )}

      {error && (
        <Text style={{ color: '#f87171', marginBottom: 16 }} role="alert">
          {error}
        </Text>
      )}

      {data && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              className="scrollable-div"
              style={{
                display: 'flex',
                justifyContent: 'center',
                maxHeight: '65%',
                overflowY: 'auto',
                width: '100%',
              }}
            >
              {data.items.length === 0 ? (
                <Text style={{ marginTop: '20px' }}>No scores yet — play a game!</Text>
              ) : (
                <Table header={['#', 'Player', 'Score']}>
                  {data.items.map((row, i) => (
                    <TableLine key={`${row.playerName}-${row.updatedAt}`}>
                      <TableCell>{(page - 1) * data.pageSize + i + 1}</TableCell>
                      <TableCell>{row.playerName}</TableCell>
                      <TableCell>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{row.highScore.toLocaleString()}</span>
                      </TableCell>
                    </TableLine>
                  ))}
                </Table>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              marginBottom: '20px',
            }}
          >
            <Text style={{ color: 'var(--primary-color, #ee2b47)', fontSize: 14 }}>
              Page {data.page} of {data.totalPages}
              {data.total > 0 ? ` · ${data.total} players` : ''}
            </Text>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Button type="button" disabled={!canPrev || loading} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button type="button" disabled={!canNext || loading} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

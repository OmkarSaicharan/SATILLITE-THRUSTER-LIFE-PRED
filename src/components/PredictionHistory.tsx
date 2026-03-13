import React from 'react';
import { fetchHistory, HistoryItem, deleteHistoryItem } from '../services/prediction';
import { motion, AnimatePresence } from 'motion/react';
import { History, Clock, AlertCircle, Trash2 } from 'lucide-react';

export const PredictionHistory: React.FC = () => {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      setDeletingId(null);
    }
  };

  React.useEffect(() => {
    loadHistory();
  }, []);

  if (isLoading) return <div className="text-white/20 text-xs text-center">Loading history...</div>;
  if (history.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
        <History size={14} /> Recent Analyses
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              layout
              className="glass-card p-4 text-xs flex justify-between items-center hover:bg-white/10 transition-colors cursor-default group"
            >
              <div className="space-y-1">
                <div className="font-medium text-white/80">{item.name}</div>
                <div className="text-white/40 flex items-center gap-2">
                  <Clock size={10} /> {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right space-y-1">
                  <div className={`font-bold ${
                    item.risk_level === 'Low' ? 'text-emerald-400' :
                    item.risk_level === 'Medium' ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>
                    {item.risk_level}
                  </div>
                  <div className="text-white/40 flex items-center gap-1 justify-end">
                    <AlertCircle size={10} /> {item.failure_probability}% Fail
                  </div>
                </div>
                
                <div className="flex items-center">
                  {deletingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 bg-white/5 text-white/40 rounded hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete analysis"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

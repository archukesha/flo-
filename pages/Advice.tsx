import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip, Card } from '../components/UI';
import { Lock, Bookmark } from 'lucide-react';

export const Advice: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const tags = ['Все', 'ПМС', 'Сон', 'Питание', 'Спорт', 'Настроение'];
  
  const articles = [
    { id: 1, title: 'Как улучшить сон во время цикла?', tags: ['Сон', 'ПМС'], isPro: false, preview: 'Простые советы для глубокого сна.' },
    { id: 2, title: 'Питание для снижения боли', tags: ['Питание', 'Боль'], isPro: true, preview: 'Продукты, которые помогают снять спазмы.' },
    { id: 3, title: 'Йога для расслабления', tags: ['Спорт', 'Спорт'], isPro: false, preview: '5 асан для снятия напряжения.' },
    { id: 4, title: 'Гормоны и настроение', tags: ['ПМС', 'Настроение'], isPro: true, preview: 'Почему мы чувствуем себя так и как с этим справиться.' },
    { id: 5, title: 'Водный баланс', tags: ['Питание'], isPro: false, preview: 'Сколько воды нужно пить в разные фазы.' },
  ];

  const filteredArticles = filter === 'All' || filter === 'Все' 
    ? articles 
    : articles.filter(a => a.tags.includes(filter));

  return (
    <div className="min-h-screen bg-surface dark:bg-black pb-24 pt-4 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Советы</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar -mx-4 px-4">
        {tags.map(t => (
            <div key={t} className="shrink-0">
                <Chip 
                    label={t} 
                    active={filter === t || (filter === 'All' && t === 'Все')} 
                    onClick={() => setFilter(t === 'Все' ? 'All' : t)}
                    color="primary"
                />
            </div>
        ))}
      </div>

      <div className="space-y-4">
        {filteredArticles.map(article => (
            <Card key={article.id} className="relative overflow-hidden active:scale-[0.99] transition-transform">
                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {article.tags.map(tag => (
                                <span key={tag} className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{tag}</span>
                            ))}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-2">
                            {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{article.preview}</p>
                    </div>
                    <button className="text-gray-300 hover:text-primary transition-colors">
                        <Bookmark size={22} />
                    </button>
                </div>
                
                {article.isPro && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                        <div className="bg-gradient-to-r from-secondary to-purple-400 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <Lock size={10} /> PRO
                        </div>
                        <span className="text-xs text-gray-400">Требуется подписка</span>
                    </div>
                )}

                {article.isPro && (
                    <div 
                        className="absolute inset-0 z-10"
                        onClick={() => navigate('/paywall')}
                    />
                )}
            </Card>
        ))}
      </div>
    </div>
  );
};
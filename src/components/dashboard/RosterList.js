"use client";

import { useState } from 'react';
import PlayerModal from '../modals/PlayerModal';

export default function RosterList({ players }) {
    const [search, setSearch] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    if (!players || players.length === 0) return null;

    const filteredPlayers = players.filter(p =>
        (p.displayName && p.displayName.toLowerCase().includes(search.toLowerCase())) ||
        (p.position && p.position.name && p.position.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {selectedPlayer && (
                <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
            )}

            <div className="mb-6 sticky top-0 bg-[#050B14] z-10 py-2">
                <input
                    type="text"
                    placeholder="Search player by name or position..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPlayers.map((player, i) => (
                    <button
                        key={player.id || player.playerId || i}
                        onClick={() => setSelectedPlayer(player)}
                        className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 hover:scale-[1.02] transition group relative text-left w-full focus:outline-none"
                    >
                        <div className="h-2 bg-gradient-to-r from-blue-900 to-red-900"></div>
                        <div className="p-4 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-slate-700 mb-3 overflow-hidden border-2 border-slate-600 group-hover:border-blue-400 transition">
                                <img
                                    src={player.headshot?.href || player.href || "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"}
                                    alt={player.displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://static.www.nfl.com/image/private/f_auto,q_auto/league/nfl-placeholder"; }}
                                />
                            </div>
                            <h4 className="font-bold text-sm text-center text-white">{player.displayName || "Unknown Player"}</h4>
                            <p className="text-xs text-blue-400 font-bold mt-1">{player.position?.abbreviation || player.position?.name || "N/A"}</p>

                            <div className="flex gap-2 mt-3 text-[10px] text-gray-500 uppercase font-bold">
                                <span className="bg-slate-900 px-2 py-1 rounded">#{player.jersey || "--"}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            {filteredPlayers.length === 0 && <p className="text-center text-gray-500 mt-10">No players found matching "{search}"</p>}
        </div>
    );
}

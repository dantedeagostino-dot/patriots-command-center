'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

const DashboardTabs = () => {
  const [pastGames, setPastGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch past games from /api/history endpoint
        const historyResponse = await fetch('/api/history');
        if (!historyResponse.ok) {
          throw new Error(`Failed to fetch game history: ${historyResponse.statusText}`);
        }
        const historyData = await historyResponse.json();

        // Validate and process history data
        if (Array.isArray(historyData)) {
          setPastGames(historyData);
        } else if (historyData && Array.isArray(historyData.games)) {
          setPastGames(historyData.games);
        } else {
          console.warn('Unexpected history data format:', historyData);
          setPastGames([]);
        }

        // Fetch stats data
        const statsResponse = await fetch('/api/stats');
        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
        }
        const statsData = await statsResponse.json();

        // Validate stats data with improved validation
        const validatedStats = validateStats(statsData);
        setStats(validatedStats);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Validates and normalizes stats data structure
   * @param {any} statsData - Raw stats data from API
   * @returns {Object} Validated stats object with default values for missing fields
   */
  const validateStats = (statsData) => {
    // Define expected stats structure with defaults
    const defaultStats = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winPercentage: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDifferential: 0,
      streakType: null, // 'W' or 'L'
      streakCount: 0,
      lastUpdated: new Date().toISOString(),
    };

    // Return defaults if data is null or undefined
    if (!statsData || typeof statsData !== 'object') {
      console.warn('Invalid stats data format:', statsData);
      return defaultStats;
    }

    // Extract and validate numeric values
    const validatedData = {
      totalGames: Number.isInteger(statsData.totalGames) ? Math.max(0, statsData.totalGames) : 0,
      wins: Number.isInteger(statsData.wins) ? Math.max(0, statsData.wins) : 0,
      losses: Number.isInteger(statsData.losses) ? Math.max(0, statsData.losses) : 0,
      pointsFor: typeof statsData.pointsFor === 'number' ? Math.max(0, statsData.pointsFor) : 0,
      pointsAgainst: typeof statsData.pointsAgainst === 'number' ? Math.max(0, statsData.pointsAgainst) : 0,
      streakType: statsData.streakType === 'W' || statsData.streakType === 'L' ? statsData.streakType : null,
      streakCount: Number.isInteger(statsData.streakCount) ? Math.max(0, statsData.streakCount) : 0,
      lastUpdated: typeof statsData.lastUpdated === 'string' ? statsData.lastUpdated : new Date().toISOString(),
    };

    // Calculate derived values
    validatedData.winPercentage = validatedData.totalGames > 0
      ? (validatedData.wins / validatedData.totalGames * 100).toFixed(1)
      : 0;

    validatedData.pointDifferential = validatedData.pointsFor - validatedData.pointsAgainst;

    return validatedData;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading dashboard data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading dashboard: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stats">Season Stats</TabsTrigger>
        <TabsTrigger value="history">Past Games</TabsTrigger>
      </TabsList>

      <TabsContent value="stats" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>2025 Season Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Games</p>
                  <p className="text-2xl font-bold">{stats.totalGames}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Wins</p>
                  <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Losses</p>
                  <p className="text-2xl font-bold text-red-600">{stats.losses}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Win %</p>
                  <p className="text-2xl font-bold">{stats.winPercentage}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Points For</p>
                  <p className="text-2xl font-bold">{stats.pointsFor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Points Against</p>
                  <p className="text-2xl font-bold">{stats.pointsAgainst}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Point Differential</p>
                  <p className={`text-2xl font-bold ${stats.pointDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.pointDifferential > 0 ? '+' : ''}{stats.pointDifferential}
                  </p>
                </div>
                {stats.streakType && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className={`text-2xl font-bold ${stats.streakType === 'W' ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.streakCount} {stats.streakType}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No stats available</p>
            )}
            {stats?.lastUpdated && (
              <p className="text-xs text-gray-400 mt-4">
                Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Past Games ({pastGames.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pastGames.length > 0 ? (
              <div className="space-y-3">
                {pastGames.map((game, index) => (
                  <div
                    key={game.id || index}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{game.opponent || 'Unknown Opponent'}</p>
                      <p className="text-sm text-gray-600">
                        {game.date ? new Date(game.date).toLocaleDateString() : 'Date unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${game.result === 'W' ? 'text-green-600' : 'text-red-600'}`}>
                        {game.result || '-'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {game.pointsFor !== undefined && game.pointsAgainst !== undefined
                          ? `${game.pointsFor} - ${game.pointsAgainst}`
                          : 'Score unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No past games available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

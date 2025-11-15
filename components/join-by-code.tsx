'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hash, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function JoinByCode({ userId }: { userId: string }) {
  const [lobbyCode, setLobbyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const handleJoinByCode = async () => {
    if (!lobbyCode.trim()) {
      alert(t('joinByCode.alertEnterCode'));
      return;
    }

    setIsJoining(true);

    try {
      const code = lobbyCode.trim();
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .select('id, status, password')
        .eq('id', code)
        .eq('status', 'waiting')
        .single();

      if (lobbyError || !lobby) {
        alert(t('joinByCode.alertNotFound'));
        setIsJoining(false);
        return;
      }

      if (lobby.password && !passwordInput) {
        setPasswordDialog(lobby.id);
        setIsJoining(false);
        return;
      }

      if (lobby.password && passwordInput !== lobby.password) {
        alert(t('joinByCode.alertWrongPassword'));
        setPasswordInput('');
        setIsJoining(false);
        return;
      }

      const { data: existingPlayer } = await supabase
        .from('lobby_players')
        .select('id')
        .eq('lobby_id', lobby.id)
        .eq('user_id', userId)
        .single();

      if (existingPlayer) {
        router.push(`/game/lobby/${lobby.id}`);
        return;
      }

      const { error: joinError } = await supabase.from('lobby_players').insert({
        lobby_id: lobby.id,
        user_id: userId,
        score: 0,
      });

      if (joinError) throw joinError;

      router.push(`/game/lobby/${lobby.id}`);
      setPasswordDialog(null);
      setPasswordInput('');
      setLobbyCode('');
    } catch (error: any) {
      console.error('[v0] Error joining by code:', error);
      alert(t('joinByCode.alertFailed'));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-purple-600" />
            {t('joinByCode.title')}
          </CardTitle>
          <CardDescription>{t('joinByCode.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lobby-code">{t('joinByCode.label')}</Label>
              <Input
                id="lobby-code"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value)}
                placeholder="e.g., 5b377900-a0dd-4fc8-..."
                className="font-mono text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && lobbyCode.trim() && !isJoining) {
                    handleJoinByCode();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleJoinByCode}
              disabled={!lobbyCode.trim() || isJoining}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('joinByCode.joining')}
                </>
              ) : (
                t('joinByCode.button')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {passwordDialog && (
        <Dialog
          open={!!passwordDialog}
          onOpenChange={() => {
            setPasswordDialog(null);
            setPasswordInput('');
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('lobby.privateTitle')}</DialogTitle>
              <DialogDescription>{t('lobby.enterPassword')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code-password">{t('lobby.password')}</Label>
                <Input
                  id="code-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && passwordInput) {
                      handleJoinByCode();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleJoinByCode}
                disabled={!passwordInput}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {t('lobby.join')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

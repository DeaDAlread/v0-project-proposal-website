"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, BookOpen, Share2, Download, Copy, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

type Deck = {
  id: string;
  name: string;
  words: string[];
  created_at: string;
};

export default function DeckManager({
  userId,
  initialDecks,
}: {
  userId: string;
  initialDecks: Deck[];
}) {
  const [decks, setDecks] = useState<Deck[]>(initialDecks);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deckName, setDeckName] = useState("");
  const [deckWords, setDeckWords] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [exportingDeck, setExportingDeck] = useState<Deck | null>(null);
  const [exportCode, setExportCode] = useState("");
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim() || !deckWords.trim()) return;

    setIsLoading(true);
    try {
      const words = deckWords
        .split("\n")
        .map(w => w.trim())
        .filter(w => w.length > 0);

      if (words.length < 5) {
        alert("Please add at least 5 words to your deck");
        return;
      }

      const { data, error } = await supabase
        .from("custom_decks")
        .insert({
          user_id: userId,
          name: deckName,
          words: words,
        })
        .select()
        .single();

      if (error) throw error;

      setDecks([data, ...decks]);
      setDeckName("");
      setDeckWords("");
      setIsCreateOpen(false);
    } catch (error) {
      console.error("[v0] Error creating deck:", error);
      alert("Failed to create deck");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeck || !deckName.trim() || !deckWords.trim()) return;

    setIsLoading(true);
    try {
      const words = deckWords
        .split("\n")
        .map(w => w.trim())
        .filter(w => w.length > 0);

      if (words.length < 5) {
        alert("Please add at least 5 words to your deck");
        return;
      }

      const { error } = await supabase
        .from("custom_decks")
        .update({
          name: deckName,
          words: words,
        })
        .eq("id", editingDeck.id);

      if (error) throw error;

      setDecks(decks.map(d =>
        d.id === editingDeck.id
          ? { ...d, name: deckName, words: words }
          : d
      ));

      setEditingDeck(null);
      setDeckName("");
      setDeckWords("");
    } catch (error) {
      console.error("[v0] Error updating deck:", error);
      alert("Failed to update deck");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck?")) return;

    try {
      const { error } = await supabase
        .from("custom_decks")
        .delete()
        .eq("id", deckId);

      if (error) throw error;

      setDecks(decks.filter(d => d.id !== deckId));
    } catch (error) {
      console.error("[v0] Error deleting deck:", error);
      alert("Failed to delete deck");
    }
  };

  const startEdit = (deck: Deck) => {
    setEditingDeck(deck);
    setDeckName(deck.name);
    setDeckWords(deck.words.join("\n"));
  };

  const cancelEdit = () => {
    setEditingDeck(null);
    setDeckName("");
    setDeckWords("");
  };

  const handleExportDeck = (deck: Deck) => {
    const deckData = {
      name: deck.name,
      words: deck.words,
      version: 1,
    };
    const encoded = btoa(JSON.stringify(deckData));
    setExportCode(encoded);
    setExportingDeck(deck);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[v0] Error copying to clipboard:", error);
      alert("Failed to copy code");
    }
  };

  const handleImportDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCode.trim()) return;

    setIsLoading(true);
    try {
      const decoded = JSON.parse(atob(importCode.trim()));
      
      if (!decoded.name || !Array.isArray(decoded.words) || decoded.words.length < 5) {
        alert("Invalid deck code. Please check and try again.");
        return;
      }

      const { data, error } = await supabase
        .from("custom_decks")
        .insert({
          user_id: userId,
          name: decoded.name,
          words: decoded.words,
        })
        .select()
        .single();

      if (error) throw error;

      setDecks([data, ...decks]);
      setImportCode("");
      setIsImportOpen(false);
      alert(`Successfully imported deck: ${decoded.name}`);
    } catch (error) {
      console.error("[v0] Error importing deck:", error);
      alert("Invalid deck code. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeExportDialog = () => {
    setExportingDeck(null);
    setExportCode("");
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-end">
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Import Deck
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Import Custom Deck</DialogTitle>
              <DialogDescription>
                Paste a deck code shared by another player to add it to your collection
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleImportDeck} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-code">Deck Code</Label>
                <Textarea
                  id="import-code"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste deck code here..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImportOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Importing..." : "Import Deck"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-purple-300 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <PlusCircle className="w-6 h-6" />
                Create New Deck
              </CardTitle>
              <CardDescription>
                Add your own custom words for the game
              </CardDescription>
            </CardHeader>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Custom Deck</DialogTitle>
            <DialogDescription>
              Add a name and words for your deck. Each word on a new line.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDeck} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Deck Name</Label>
              <Input
                id="name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="e.g., Famous Scientists"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="words">Words (one per line, minimum 5)</Label>
              <Textarea
                id="words"
                value={deckWords}
                onChange={(e) => setDeckWords(e.target.value)}
                placeholder="Einstein&#10;Newton&#10;Curie&#10;Darwin&#10;Tesla"
                rows={8}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Deck"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!exportingDeck} onOpenChange={(open) => !open && closeExportDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Deck: {exportingDeck?.name}</DialogTitle>
            <DialogDescription>
              Share this code with others so they can import your deck
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-code">Deck Code</Label>
              <div className="relative">
                <Textarea
                  id="export-code"
                  value={exportCode}
                  readOnly
                  rows={4}
                  className="pr-10 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeExportDialog}
              >
                Close
              </Button>
              <Button onClick={handleCopyCode} className="gap-2">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {decks.map((deck) => (
          <Card key={deck.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    {deck.name}
                  </CardTitle>
                  <CardDescription>
                    {deck.words.length} words
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportDeck(deck)}
                    title="Export deck"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Dialog
                    open={editingDeck?.id === deck.id}
                    onOpenChange={(open) => !open && cancelEdit()}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(deck)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Edit Deck</DialogTitle>
                        <DialogDescription>
                          Update your deck name and words
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateDeck} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Deck Name</Label>
                          <Input
                            id="edit-name"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-words">
                            Words (one per line, minimum 5)
                          </Label>
                          <Textarea
                            id="edit-words"
                            value={deckWords}
                            onChange={(e) => setDeckWords(e.target.value)}
                            rows={8}
                            required
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDeck(deck.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {deck.words.slice(0, 8).map((word, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {word}
                  </Badge>
                ))}
                {deck.words.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{deck.words.length - 8} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {decks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No custom decks yet. Create your first deck to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

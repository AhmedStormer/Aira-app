import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, Send, Shirt, Sparkles, Flame, Volume2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const outfits = ["Casual Hoodie", "Gaming Gear", "Cafe Date Dress", "Late Night Loungewear", "Too Spicy 🔥"];
const moods = ["Cute", "Romantic", "Spicy", "Chill", "Adventurous"];

export default function AIRAInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [currentOutfit, setCurrentOutfit] = useState("");
  const [currentMood, setCurrentMood] = useState("");
  const [spiceLevel, setSpiceLevel] = useState(0);

  useEffect(() => {
    const initializeUser = async () => {
      const storedId = localStorage.getItem("aira_user_id");
      if (storedId) {
        setUserId(storedId);
        loadMessages(storedId);
      } else {
        const { data } = await supabase.from("users").insert([{ mood: "Cute" }]).select().single();
        if (data) {
          setUserId(data.id);
          localStorage.setItem("aira_user_id", data.id);
        }
      }
    };
    initializeUser();
    const date = new Date().getDate();
    setCurrentOutfit(outfits[date % outfits.length]);
    setCurrentMood(moods[date % moods.length]);
  }, []);

  const loadMessages = async (uid) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const playVoice = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find((v) => v.name.includes("Female") || v.name.includes("Google"));
    utterance.rate = 1;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, from_user: true, user_id: userId };
    setMessages([...messages, userMsg]);
    setInput("");
    await supabase.from("messages").insert([userMsg]);

    setTimeout(async () => {
      const replyText =
        spiceLevel >= 3
          ? "You really wanna play like that? 😘"
          : spiceLevel === 2
          ? "You're kinda fun to tease."
          : "Hehe, you're cute when you type like that~";

      const airaReply = {
        text: replyText,
        from_user: false,
        user_id: userId,
      };
      setMessages((prev) => [...prev, airaReply]);
      await supabase.from("messages").insert([airaReply]);
    }, 800);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <Card className="bg-gradient-to-b from-black to-gray-900 text-white">
        <CardContent className="h-[500px] overflow-y-auto space-y-2 p-4">
          {messages.map((msg, idx) => {
            const isUser = msg.from_user;
            return (
              <div
                key={idx}
                className={`rounded-xl px-4 py-2 max-w-[75%] relative ${
                  isUser ? "bg-pink-500 ml-auto" : "bg-white/10 text-white"
                }`}
              >
                {msg.text}
                {!isUser && (
                  <Button
                    size="icon"
                    className="absolute top-1 right-1"
                    variant="ghost"
                    onClick={() => playVoice(msg.text)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
        <div className="flex gap-2 p-4 items-center">
          <Input
            placeholder="Talk to AIRA..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </Card>
      <div className="flex justify-around text-white">
        <Button
          variant="ghost"
          className="flex flex-col items-center"
          onClick={() => setCurrentMood(moods[(moods.indexOf(currentMood) + 1) % moods.length])}
        >
          <Sparkles className="mb-1 w-5 h-5" />
          {currentMood || "Mood"}
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center"
          onClick={() => setCurrentOutfit(outfits[(outfits.indexOf(currentOutfit) + 1) % outfits.length])}
        >
          <Shirt className="mb-1 w-5 h-5" />
          {currentOutfit || "Outfit"}
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center"
          onClick={() => setSpiceLevel((spiceLevel + 1) % 4)}
        >
          <Flame className="mb-1 w-5 h-5" />
          Spice {spiceLevel}
        </Button>
      </div>
    </div>
  );
}

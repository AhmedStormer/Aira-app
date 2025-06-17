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
    const date = new Date().ge

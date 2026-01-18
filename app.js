const sb = supabase.createClient(
  "https://anlktalskporlebnghpp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubGt0YWxza3BvcmxlYm5naHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDA0NTksImV4cCI6MjA4NDMxNjQ1OX0.fF8Li77jRqGqtTk2CRIXR1J1SS8AVb2YeuXzT-5J-Eg"
);

let currentRoom = null;
let participantId = null;

function code() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

document.getElementById("createBtn").onclick = async () => {
  const name = roomName.value || "F1 Room";
  const roomCode = code();

  const { data, error } = await sb
    .from("rooms")
    .insert({ name, code: roomCode })
    .select()
    .single();

  if (error) return alert(error.message);
  enterRoom(data);
};

document.getElementById("joinBtn").onclick = async () => {
  const c = prompt("Room code?");
  if (!c) return;

  const { data, error } = await sb
    .from("rooms")
    .select()
    .eq("code", c)
    .single();

  if (error) return alert("Room not found");
  enterRoom(data);
};

function enterRoom(room) {
  currentRoom = room;
  landing.classList.add("hidden");
  document.getElementById("room").classList.remove("hidden");
  roomCode.textContent = room.code;
  loadPredictions();
}

document.getElementById("joinRoomBtn").onclick = async () => {
  const { data, error } = await sb
    .from("participants")
    .insert({
      room_id: currentRoom.id,
      name: userName.value,
      team_color: team.value
    })
    .select()
    .single();

  if (error) return alert(error.message);
  participantId = data.id;
};

document.getElementById("predictBtn").onclick = async () => {
  if (!participantId) return alert("Join first");

  await sb.from("predictions").insert({
    room_id: currentRoom.id,
    participant_id: participantId,
    text: predictionText.value
  });

  predictionText.value = "";
  loadPredictions();
};

async function loadPredictions() {
  const { data } = await sb
    .from("predictions")
    .select("text")
    .eq("room_id", currentRoom.id);

  predictions.innerHTML = "";
  data?.forEach(p => {
    const li = document.createElement("li");
    li.textContent = "• " + p.text;
    predictions.appendChild(li);
  });
}

document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(currentRoom.code);
  alert("Copied!");
};

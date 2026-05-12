"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [userId, setUserId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data } = await supabase
        .from("members")
        .select("id, name, phone, notes")
        .eq("user_id", user.id)
        .order("name");
      setMembers(data ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSaveError("");
    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from("members")
      .insert({
        user_id: userId,
        name: name.trim(),
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      })
      .select()
      .single();

    setSaving(false);

    if (insertError || !data) {
      console.error("[GolfMate] members insert 실패:", JSON.stringify(insertError, null, 2));
      setSaveError(
        insertError
          ? `오류 (${insertError.code}): ${insertError.message}`
          : "저장 실패: 반환 데이터 없음"
      );
      return;
    }

    setMembers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
    setPhone("");
    setNotes("");
    setSaveError("");
    setShowForm(false);
  }

  function startEdit(member: Member) {
    setEditingId(member.id);
    setEditName(member.name);
    setEditPhone(member.phone ?? "");
    setEditNotes(member.notes ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setEditSaving(true);
    const supabase = createClient();
    await supabase
      .from("members")
      .update({
        name: editName.trim(),
        phone: editPhone.trim() || null,
        notes: editNotes.trim() || null,
      })
      .eq("id", id);
    setMembers((prev) =>
      prev
        .map((m) =>
          m.id === id
            ? { ...m, name: editName.trim(), phone: editPhone.trim() || null, notes: editNotes.trim() || null }
            : m
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditSaving(false);
    setEditingId(null);
  }

  async function handleDelete(id: string, memberName: string) {
    if (!window.confirm(`${memberName} 멤버를 삭제할까요?`)) return;
    const supabase = createClient();
    await supabase.from("members").delete().eq("id", id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-md mx-auto px-4 py-6 text-center text-gray-400 text-sm pt-20">
          불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">

        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <Link href="/my" className="text-white/70 hover:text-white text-sm">← 뒤로</Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">👥 멤버 관리</h1>
              <p className="text-xs text-white/70 mt-0.5">자주 같이 치는 멤버를 저장하세요</p>
            </div>
          </div>
        </header>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {showForm ? "취소" : "+ 멤버 추가하기"}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#1F2937]">새 멤버 등록</p>
            {saveError && (
              <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2">
                {saveError}
              </div>
            )}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 *"
              required
              autoFocus
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="연락처 (선택)"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="핸디, 타수, 관계 등 자유롭게 입력"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#B7791F] hover:bg-[#9a6519] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </form>
        )}

        {members.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center flex flex-col gap-2">
            <p className="text-gray-500 text-sm font-medium">저장된 멤버가 없습니다</p>
            <p className="text-gray-400 text-xs">멤버를 등록하면 라운딩 생성 시<br/>한 번에 빠르게 추가할 수 있어요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400 px-1">총 {members.length}명</p>
            {members.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm p-4">
                {editingId === m.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="이름 *"
                      autoFocus
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="연락처 (선택)"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="핸디, 타수, 관계 등 자유롭게 입력"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleUpdate(m.id)}
                        disabled={editSaving || !editName.trim()}
                        className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                      >
                        {editSaving ? "저장 중..." : "저장"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 rounded-lg text-sm transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#F0F9F4] flex items-center justify-center text-[#1B4332] font-bold text-sm shrink-0">
                        {m.name?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{m.name}</p>
                        {m.phone && <p className="text-xs text-gray-400 mt-0.5 truncate">📞 {m.phone}</p>}
                        {m.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">💬 {m.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(m)}
                        className="text-[#2D6A4F] hover:text-[#1B4332] text-xs px-3 py-1.5 rounded-lg border border-[#2D6A4F] hover:bg-[#F0F9F4] transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="text-red-400 hover:text-red-600 text-xs px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#F0F9F4] rounded-2xl p-4">
          <p className="text-xs text-[#2D6A4F] font-medium">💡 Tip</p>
          <p className="text-xs text-[#2D6A4F] mt-1">
            라운딩 만들기에서 저장된 멤버를 버튼 하나로 바로 추가할 수 있어요.
          </p>
        </div>

      </div>
    </main>
  );
}

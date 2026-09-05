import React, { useState } from "react";
import { Bell, Plus, Pin, Trash2, Send } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useNotificationsStore } from "../../store/notificationsStore";
import { useAppStore } from "../../store/appStore";
import { NotificationType } from "../../types";

export const AdminNotifications: React.FC = () => {
  const { notifications, addNotification, deleteNotification, togglePin } = useNotificationsStore();
  const { addToast } = useAppStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<NotificationType>("announcement");
  const [pinned, setPinned] = useState(true);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addNotification({
      title,
      content,
      type,
      pinned,
      author: "Capacity Connect Admin"
    });

    setTitle("");
    setContent("");
    addToast({
      title: "Announcement Broadcasted",
      message: "Published to homepage announcement center and user feeds.",
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Homepage Announcement Center"
      breadcrumbs={[
        { label: "Admin Dashboard", to: "/admin/dashboard" },
        { label: "Announcements" }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator Box */}
        <div className="card p-6 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-white">Broadcast Announcement</h3>
          <form onSubmit={handlePublish} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Quarterly Capacity Building Hackathon"
                className="apple-input text-xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Body</label>
              <textarea
                rows={3}
                required
                placeholder="Details of the announcement..."
                className="apple-input text-xs"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  className="apple-input text-xs"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="announcement">Announcement</option>
                  <option value="achievement">Achievement</option>
                  <option value="new_content">New Content</option>
                  <option value="alert">System Alert</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <label htmlFor="pinCheck" className="text-xs text-slate-300">Pin to Homepage</label>
              </div>
            </div>

            <button type="submit" className="apple-btn-primary w-full py-2.5 text-xs font-bold mt-2">
              <Send className="w-3.5 h-3.5" /> Broadcast to Portal
            </button>
          </form>
        </div>

        {/* Existing Announcements */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Active Announcements ({notifications.length})</h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge-blue text-[9px] uppercase">{n.type}</span>
                    {n.pinned && <span className="badge-yellow text-[9px]">PINNED</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(n.id)}
                      className="p-1 text-slate-400 hover:text-amber-400"
                      title="Toggle Pin"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white">{n.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{n.content}</p>
                <p className="text-[10px] text-slate-500 font-mono">By {n.author} • {new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default AdminNotifications;

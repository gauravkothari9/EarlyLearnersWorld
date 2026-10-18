import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Crown, Download, ExternalLink, Loader2, Mic, RotateCcw, Trash2, Upload, Pencil } from 'lucide-react';
import { api } from '../api';

const STATUS_LABEL = {
  queued: 'Queued',
  rendering: 'Animating',
  encoding: 'Mixing sound',
  ready: 'Ready',
  uploading: 'Uploading',
  published: 'Published',
  failed: 'Failed',
};
const ACTIVE = new Set(['queued', 'rendering', 'encoding', 'uploading']);

export default function JobCard({ job, categoryName, onChanged, notify }) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [confirmAgain, setConfirmAgain] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const active = ACTIVE.has(job.status);
  // scheduled to go live later (held here, or uploaded with YouTube's publishAt)
  const pendingLive = Boolean(job.scheduledFor) && new Date(job.scheduledFor) > new Date();

  const act = async (fn, okMsg) => {
    try {
      await fn();
      if (okMsg) notify(okMsg);
      onChanged();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const startEdit = () => {
    setDraft({ title: job.title || '', description: job.description || '', tags: (job.tags || []).join(', ') });
    setEditing(true);
  };

  const saveEdit = () =>
    act(async () => {
      await api.updateJob(job.id, {
        title: draft.title,
        description: draft.description,
        tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setEditing(false);
    }, 'Details saved');

  return (
    <article className="job-card">
      <div className={`job-media${job.format === 'video' ? ' land' : ''}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {job.videoUrl && hover ? (
          <video src={job.videoUrl} poster={job.thumbnailUrl} autoPlay muted loop playsInline />
        ) : job.thumbnailUrl ? (
          <img src={job.thumbnailUrl} alt={`${categoryName} still`} />
        ) : job.videoUrl ? (
          <video src={`${job.videoUrl}#t=2`} preload="metadata" muted playsInline />
        ) : (
          <div className="preview-pending">
            {active ? <Loader2 className="spin" size={22} /> : null}
          </div>
        )}
        <span className={`status status-${pendingLive ? 'scheduled' : job.status}`}>
          {pendingLive && ['published', 'ready'].includes(job.status) ? 'Scheduled' : STATUS_LABEL[job.status]}
        </span>
      </div>

      <div className="job-body">
        <div className="job-meta">
          <span>{categoryName}</span>
          <span>· {job.format === 'video' ? 'Video 16:9' : 'Short'}</span>
          {job.trial && <span className="trial-tag">Trial</span>}
          {job.duration && <span>· {Math.round(job.duration)}s</span>}
        </div>

        {active && (
          <div className="progress" aria-label={`${Math.round(job.progress * 100)}%`}>
            <div style={{ width: `${Math.max(3, job.progress * 100)}%` }} />
          </div>
        )}

        {job.title && !editing && <h4 className="job-title">{job.title}</h4>}
        {job.tags?.length > 0 && !editing && (
          <p className="job-tags">{job.tags.slice(0, 8).map((t) => `#${t.replace(/\s+/g, '')}`).join(' ')}</p>
        )}

        {editing && (
          <div className="job-edit">
            <label>
              Title
              <input value={draft.title} maxLength={100} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              Description
              <textarea rows={5} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </label>
            <label>
              Tags (comma separated)
              <textarea rows={3} value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
            </label>
            <div className="row">
              <button className="btn primary sm" onClick={saveEdit}>Save</button>
              <button className="btn ghost sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}

        {pendingLive && (
          <p className="job-when">
            <CalendarClock size={13} /> Goes live {new Date(job.scheduledFor).toLocaleString(undefined, {
              weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </p>
        )}
        {job.voice && <p className="job-music" title={`Narrator: ${job.voice}`}><Mic size={12} /> {job.voice}</p>}
        {job.note && <p className="job-note">{job.note}</p>}
        {job.error && <p className="job-error">{job.error}</p>}

        <div className="job-actions">
          {job.status === 'published' && (
            <>
              <a className="btn primary sm" href={job.youtubeUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> View on YouTube
              </a>
              <a className="btn ghost sm" href={`https://studio.youtube.com/video/${job.youtubeId}/edit`} target="_blank" rel="noreferrer"
                title="Open in YouTube Studio">Studio</a>
              {confirmAgain ? (
                <button className="btn ghost sm warn-btn" onClick={() => {
                  setConfirmAgain(false);
                  act(() => api.publishJob(job.id, { again: true }), 'Uploading again as a new video');
                }}>Confirm re-upload?</button>
              ) : (
                <button className="btn ghost sm icon" title="Upload again as a new YouTube video" onClick={() => setConfirmAgain(true)}>
                  <Upload size={14} />
                </button>
              )}
            </>
          )}
          {job.status === 'ready' && job.trial && (
            <Link to="/pricing" className="btn primary sm"><Crown size={14} /> Upgrade to upload</Link>
          )}
          {job.status === 'ready' && !job.trial && (
            pendingLive ? (
              <button className="btn primary sm" title="Skip the scheduled time and upload now"
                onClick={() => act(() => api.publishJob(job.id, { now: true }), 'Uploading to YouTube')}>
                <Upload size={14} /> Upload now
              </button>
            ) : (
              <button className="btn primary sm" onClick={() => act(() => api.publishJob(job.id), 'Uploading to YouTube')}>
                <Upload size={14} /> {job.error ? 'Retry upload' : 'Upload to YouTube'}
              </button>
            )
          )}
          {job.status === 'ready' && !editing && (
            <button className="btn ghost sm icon" title="Edit title, description, tags" onClick={startEdit}>
              <Pencil size={14} />
            </button>
          )}
          {job.status === 'failed' && (
            <button className="btn ghost sm" onClick={() => act(() => api.retryJob(job.id))}>
              <RotateCcw size={14} /> Retry
            </button>
          )}
          {job.videoUrl && (
            <a className="btn ghost sm icon" href={job.videoUrl} download title="Download MP4">
              <Download size={14} />
            </a>
          )}
          {!active && (
            confirmDelete ? (
              <>
                <button className="btn ghost sm warn-btn" onClick={() => act(() => api.deleteJob(job.id),
                  job.youtubeId ? 'Deleted here. The video is still on YouTube.' : 'Deleted')}>
                  <Trash2 size={14} /> Delete{job.youtubeId ? ' here' : ''}?
                </button>
                <button className="btn ghost sm" onClick={() => setConfirmDelete(false)}>Keep</button>
              </>
            ) : (
              <button className="btn ghost sm icon danger" onClick={() => setConfirmDelete(true)}
                title={job.youtubeId ? 'Delete from this app (the YouTube video stays)' : 'Delete'}>
                <Trash2 size={14} />
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}

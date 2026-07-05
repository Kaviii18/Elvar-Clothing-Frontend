import { FC } from 'react';

const MESSAGE =
  'NEW ARRIVALS ✦ FREE SHIPPING OVER LKR 50,000 ✦ FREE RETURNS 14 DAYS ✦ HAND-INSPECTED EVERY PIECE ✦ ';

const AnnouncementBar: FC = () => (
  <>
    <style>{`
      @keyframes ev-announcement-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ev-announcement-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 101;
        height: 32px;
        background: #111110;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: 0 16px;
      }
      @media (min-width: 640px) {
        .ev-announcement-bar { padding: 0 32px; }
      }
      .ev-announcement-track {
        display: inline-flex;
        align-items: center;
        min-width: 200%;
        white-space: nowrap;
        animation: ev-announcement-scroll 18s linear infinite;
      }
      .ev-announcement-text {
        color: rgba(240, 235, 225, 0.65);
        font-family: 'Didact Gothic', sans-serif;
        font-size: 0.8rem;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        display: inline-block;
        padding-right: 4rem;
      }
    `}</style>

    <div className="ev-announcement-bar">
      <div className="ev-announcement-track" aria-label="Site announcement">
        <span className="ev-announcement-text">{MESSAGE}</span>
        <span className="ev-announcement-text">{MESSAGE}</span>
      </div>
    </div>
  </>
);

export default AnnouncementBar;

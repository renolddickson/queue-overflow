import React from "react";

const YouTubeIframe = ({ link }: { link: string }) => {
  return (
    <div className="max-w-screen-md w-full mx-auto">
      <iframe
        className="w-full aspect-video"
        src={`https://www.youtube.com/embed/${extractVideoId(link)}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const extractVideoId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : "";
};

export default YouTubeIframe;

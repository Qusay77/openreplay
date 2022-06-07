import React from 'react';
import { IconButton } from 'UI';
import copy from 'copy-to-clipboard';
import { connectPlayer } from 'Player';

interface Props {
  content: string;
  time: any;
}
function SessionCopyLink({ content = '', time }: Props) {
  const [copied, setCopied] = React.useState(false)

  const copyHandler = () => {
    setCopied(true);
    copy(window.location.origin + window.location.pathname +  '?jumpto=' + Math.round(time));
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="flex justify-between items-center w-full mt-2">
        <IconButton label="Copy URL at current time" primaryText icon="link-45deg" onClick={copyHandler} />
        { copied && <div className="color-gray-medium">Copied</div> }
    </div>
  )
}

export default SessionCopyLink

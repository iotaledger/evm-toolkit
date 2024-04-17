import { ChainReference } from "$lib/evm-toolkit";

export function handleEnterKeyDown(
  event: KeyboardEvent,
  callback: () => void,
): void {
  if (event?.key === 'Enter' && callback && typeof callback === 'function') {
    callback();
  }
}

export function handleEscapeKeyDown(
  event: KeyboardEvent,
  callback: () => void,
): void {
  if (event?.key === 'Escape' && callback && typeof callback === 'function') {
    callback();
  }
}

export const truncateText = (
  text: string,
  charsStart: number = 6,
  charsEnd: number = 4,
) =>
  text?.length > charsStart + charsEnd
    ? `${text?.slice(0, charsStart)}...${text?.slice(-charsEnd)}`
    : text;

export const copyToClipboard = (content: string): Promise<void> =>
  navigator.clipboard.writeText(content);


// Reference: https://gist.github.com/omrumbakitemiz/3d8b7d713b84cb2bd2e572be19fbe698
export function generateRandomId(): string {
  let d = new Date().getTime();
  let d2 =
    (typeof performance !== 'undefined' &&
      performance.now &&
      performance.now() * 1000) ||
    0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getBech32AddressLengthFromChain(chain: ChainReference): number {
  switch (chain) {
    case ChainReference.IOTAEVM:
      return 64;
    case ChainReference.ShimmerEVM:
    case ChainReference.ShimmerEVMTestnet:
    case ChainReference.IOTAEVMTestnet:
      return 63;
    default:
      return 64;
  }
}
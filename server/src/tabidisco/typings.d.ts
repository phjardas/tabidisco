declare module 'mp3-parser' {
  interface Tag {
    readonly frames?: Frame[];
  }

  interface FrameHeader {
    readonly id: string;
  }

  interface FrameContent {
    text?: string;
    value?: any;
  }

  interface Frame {
    readonly header: FrameHeader;
    readonly name: string;
    readonly content: FrameContent;
  }

  export function readTags(data: DataView): Tag[];
}

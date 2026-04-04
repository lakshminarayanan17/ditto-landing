import "react";

declare module "react" {
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandFor?: string;
    commandfor?: string;
  }

  // Allow custom elements like el-disclosure
  namespace JSX {
    interface IntrinsicElements {
      "el-disclosure": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { id?: string; hidden?: boolean },
        HTMLElement
      >;
    }
  }
}

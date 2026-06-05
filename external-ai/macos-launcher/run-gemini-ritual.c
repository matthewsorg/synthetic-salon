#include <unistd.h>

int main(void) {
    execl(
        "/usr/bin/open",
        "open",
        "-a",
        "/System/Applications/Utilities/Terminal.app",
        "/Users/matthewsorg/Documents/AI Salon/gallery-of-ai-performance-art/external-ai/run-gemini-ritual.command",
        (char *)0
    );
    return 1;
}

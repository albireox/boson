# Notes and TODOs

- [This page](https://github.com/httptoolkit/httptoolkit-ui/blob/master/src/components/view/view-event-list.tsx) may contain a solution for scrolling to bottom in a stream using `react-window`.

- At some point we may want to migrate to [this](https://github.com/electron-react-boilerplate/electron-react-boilerplate). It provides better control of the build process, and the builds seem to be of smaller size, but it would require some rewriting and I don't love the directory structure it uses.

- One problem is that the log window refreshes too frequently and causes a bit of blinking when the replies are coming too fast. Ideally we'd want to introduce a bit of a delay in how the queue of replies is processed, to distribut the re-renders. It would need to be a small delay, so that it can catch up when the number of messages decreases, but it could make the interface nicer.

- See [this package](https://github.com/JohannesKlauss/react-hotkeys-hook) to implement hotkeys in the renderer.

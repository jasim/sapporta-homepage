## Couldn't an LLM one-shot this?

No, I tried it, and I found that despite LLMs, building database-based
applications still took far too much time. Consider making a spreadsheet to keep
track of your monthly expenses. There is very little ceremony: you create a new
sheet and start adding data. But what if you wanted a bit more structure and
convenience? Let's say you want to add data to it from an LLM, dictate in
free-form text, and have it structured correctly. Or you want more reports, and
so on. All the things that make a software developer reach for code.

That immediately changes the scale of the effort, even with an LLM. Prompting is
not free. I don't count tokens or worry too much about how much I spend on
tokens because I'm on a subscription plan, but that doesn't mean programming has
suddenly become a one-shot affair.

Take Rails. It is a batteries-included web framework and has a pretty powerful
ORM for database work. But for the actual user interface, we are left to fend
for ourselves. We have to set up listing, editing, filtering, and so on from
scratch. Remember: prompts are not free. There are micro-decisions, and making
those decisions involves careful deliberation. That is work. The waiting time is
work, and the backtracking and retrying when the results are not what we want is
also work. The complexity accrues once foreign keys and master-child
relationships come into play.

A simple form wouldn't suffice anymore. I tend to like rich, interactive
applications, and so instead of plain HTML forms, I want to render them using
React as an SPA. Now we need APIs as well as all the decisions that come from
creating a UI with React.

![A task detail page showing project, tags, state, priority, and due date](/assets/home/exercise-workflow/task-detail.png "Application-owned views can compose generated records and actions.")

I have always wanted keyboard-accessible grids. Another long-held desire is to
have master-detail relationships represented as nested data grids that I can
explore using the keyboard. I want to expand and collapse parent rows, see
related data from other tables, and navigate the connected set of data through a
single, seamless interface.

Putting all of this together would have been a huge task before, but now that it
is here, I am excited about the applications we can build with it. A mundane
application can become a joy to use, at least for me. That is my sensibility. I
am not sure it will be joyful for everyone, but I hope there are other people
who want to use web applications with the keyboard. I use Vimium a lot, and I do
not want to look at two-letter shortcuts for every single action. I want the
power of a spreadsheet even in the simplest applications, and that is now
possible.

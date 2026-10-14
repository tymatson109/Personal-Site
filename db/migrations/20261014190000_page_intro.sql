-- Pages get an opening line under their headline, so the About page's headline, intro and story are all edited in the admin.
-- The About page starts with the words the site shows today, so nothing changes on the site until Ty edits it.

alter table public.pages add column intro text not null default '';

update public.pages
   set title = 'Hi, I’m Ty.',
       intro = 'I build iPhone apps and the web tools around them. This site holds everything I make and write.'
 where slug = 'about' and title = 'About' and intro = '';

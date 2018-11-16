# Answers
I just want an easy to use straight forward Questions And Answers thing to use with my teams or my communities. This is not a comprehensive end all be all massive web server to house millions of users, if you want that you'll need to modify some stuff. This is made to support a good size team or community.

# Open Source Stack Overflow?
So what is this thing? It is a very simple, straight forward questions and answers application that you can run on any size web server. You can even run this on a raspberry pi if you wanted to. There is no heavy account systems, emails or anything like that right now, it is just simple and straight forward. You setup the Q&A server, create an admin, and then manually accept user account requests. This makes it super easy for you to work privately with your team and avoid spam. Of course, if you need automatic user accepting, you can easily modify the code to add email verification.

## Basic project structure
Everything is a service and an endpoint in this system. So you can just swap out a service with another service and completely change how the system works. For example, the base database used for this is SQLite, all you have to do is swap out the "db.js" file in the services with your own custom one (or someone elses if one exists) and it could support MySQL or any other kind of database.

# How To Setup?
#1 Pull the code from git onto your server (or local machine).
#2 Make sure you have Node installed
#3 Run the server with npm start
#4 Go to `host_address:port/setup` (where host address is your server's host address and the port number is the port that you set to listen on)
#5 Input your admin username and password

This completes your setup and you are ready to start using the application.

## How do members join?
#1 Go to the web page for the server
#2 They type in a username they want to have
#3 They type in a password they want to have
#4 They click the "Request Account" button instead of the login button

After they have requested a login, you (the admin) has to approve them. So just go to `/user/requests` on your server to see the list of requested users. From there just click on **Approve** to unlock their account to be used.

# Use the official Nginx image as the base
FROM nginx:alpine

# Copy the static website files to Nginx's default html directory
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/

# Expose port 8887 to allow external access
EXPOSE 8887

# (Optional) If you want Nginx to listen on port 8887 inside the container,
# you can add a custom Nginx configuration as follows:
#
# COPY nginx.conf /etc/nginx/nginx.conf

module.exports = () => {
    console.log('→ ensure sudoer');
    console.log('hostile -> ensure /etc/hosts');
    console.log('→ local ip -> docker-entrypoint.sh (map over lines)');
    console.log('→ docker-compose -f docker-compose.dev.yml setup');
};

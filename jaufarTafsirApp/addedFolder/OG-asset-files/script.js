    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const menuButton = document.getElementById('menuButton');
    const closeButton = document.getElementById('closeButton');

    function openSidebar() {
        sidebar.classList.add('open');
        content.classList.add('blurred');
        menuButton.style.display = 'none';
        closeButton.style.display = 'block';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        content.classList.remove('blurred');
        menuButton.style.display = 'block';
        closeButton.style.display = 'none';
    }

    function closeSidebarIfOutside(event) {
        if (!sidebar.contains(event.target) && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    }

    function showDialog() {
        closeSidebar();
        document.getElementById('htmlDialog').showModal();
    }

    function closeDialog() {
        document.getElementById('htmlDialog').close();
    }
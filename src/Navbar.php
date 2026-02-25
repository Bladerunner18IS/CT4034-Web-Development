<nav>
    <ul>
        <?php
            $urls = array(
                'Home' => '/home.php',
                'About' => '/about.php',
                'Contact' => '/contact.php'
            );

            foreach ($urls as $name => $url) {
                print '<li ' . (($currentPage === $name) ? ' class="active" ': '') .
                    '><a href="' . $url . '">' . $name . '</a></li>';
            }
        ?>
    </ul>
</nav>
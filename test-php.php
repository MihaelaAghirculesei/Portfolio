<?php
echo "PHP funziona!";
echo "<br>POST data: ";
print_r($_POST);
echo "<br>Raw input: ";
echo file_get_contents('php://input');
echo "<br>Method: " . $_SERVER['REQUEST_METHOD'];
?>
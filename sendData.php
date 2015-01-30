<?php
	$error = false;
	$message = "";

	foreach($_POST as $key => $val) {	
		$message = $message . $key.': '.$val.'\r\n\n';

		if($val === '') {
			$error = true;
		}
	}

	if(!$error) {
		if($_POST['checkCode'] === $_POST['formularCode']) {
			echo $message;

			$receipient = 'hni.develop@gmail.com';
			$subject = 'Glitter Order';
			
			mail($receipient, $subject, $message);
		}
	}
?>
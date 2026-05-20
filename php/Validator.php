<?php

class Validator {

    private $data;
    private $current_field;

    private $current_alias;

    private $response_messages = [
        "required" => "{field} is required.",
        "alpha_ap" => "{field} may only contain alphabetic characters and apostrophes",
        "email" => "{field} must be a valid email address",
        "max_len" => "{field} is too long",
        "min_len" => "{field} is too short",
        "equals" => "{field} does not match",
        "must_contain" => "{field} must contain {chars}"
    ];

    public $error_messages = [];

    private $next = true;

    function __construct($data){
        $this->data = $data;
    } 

    private function add_error_message($type, $others = []){
        $field_name = $this->current_alias ? ucfirst($this->current_alias) : ucfirst($this->current_field);
        $msg = str_replace('{field}', $field_name, $this->response_messages[$type]);
        foreach($others as $key => $val){
            $msg = str_replace('{'.$key.'}', $val, $msg);
        }
        $this->error_messages[$this-> current_field] = $msg;
    }

    private function exists(){
        if (!isset($this->data[$this->current_field]) || !$this->data[$this->current_field]){
            return false;
        }
        return true;
    }

    private function set_response_message($messages){
        foreach($messages as $key => $val){
            $this->response_messages[$key] = $val;
        } 
    } 

    function field($name, $alias = null){
        $this->current_field = $name;
        $this->next = true;
        $this->current_alias = $alias;
        return $this;
    }

    function required(){
        if (!$this->exists()){
            $this->add_error_message('required');
            $this->next = false;
        }
        return $this;
    }

    function alpha_ap(){
        if($this->next && $this->exists() && !ctype_alpha(str_replace('\'', '', $this->data[$this->current_field]))){
            $this->add_error_message('alpha_ap');
            $this->next = false;
        }
        return $this;
    }
    
    function email(){
        if ($this->next && $this->exists() && !filter_var($this->data[$this->current_field], FILTER_VALIDATE_EMAIL)){
            $this->add_error_message('email');
            $this->next = false;
        }
        return $this;
    }

    function max_len($size){
        if($this->next && $this->exists() && strlen($this->data[$this->current_field]) > $size){
            $this->add_error_message('max_len');
            $this->next = false;
        }
        return $this;
    }

    function min_len($size){
        if($this->next && $this->exists() && strlen($this->data[$this->current_field]) < $size){
            $this->add_error_message('min_len');
            $this->next = false;
        }
        return $this;
    }

    function equals($value){
        if($this->next && $this->exists() && !$this->data[$this->current_field] == $value){
            $this->add_error_message('equals');
            $this->next = false;
        }
        return $this;
    }

    function must_contain($chars){
        if($this->next && $this->exists() && !preg_match("/[".$chars."]/i", $this->data[$this->current_field])){
            $this->add_error_message('must_contain', ['chars' => $chars]);
            $this->next = false;
        }
        return $this;
    }

    function exact_match(array $values){
        $expression = "/^" . implode("|", $values) . "$/";
        if($this->next && $this->exists() && !preg_match($expression, $this->data[$this->current_field])){
            $this->add_error_message('exact_match', ['values' => $values]);
            $this->next = false;
        }
        return $this;
    }

    function is_valid(){
        return count($this->error_messages) == 0;
    }
}
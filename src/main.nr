use dep::std;

struct Query {
    slot: Field,
    operator: Field,
    thresholds: [Field; 20],
}

struct SignatureData {
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    signature: [u8; 64],
    hashed_message: [u8; 32],
}


fn main(
    values: [Field; 50],
    query: pub Query,
    signatureData: pub SignatureData
    ) {
    verifySignature(signatureData.pub_key_x, signatureData.pub_key_y, signatureData.signature, signatureData.hashed_message);
    let slotValue = slotValue(values, query.slot);
    operatorCheck(slotValue, query.thresholds, query.operator);
}

fn verifySignature(
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    signature: [u8; 64],
    hashed_message: [u8],
) {
    let res = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hashed_message);
    constrain res == 1;
}

fn slotValue(values: [Field], slot: Field) -> Field {
    let arrayLength = values.len();
    let mut returnVal = 0;
    for i in 0..arrayLength {
        if (i == slot) {
            returnVal = values[i];
        }
    }
    returnVal
}

fn operatorCheck(value: Field, thresholds: [Field], operator: Field) {

    let threshold = thresholds[0];
    let inVal = thresholds.any(|a| a == value);
    let outVal = thresholds.any(|a| a != value);

    if(operator == 0) {
        constrain value != threshold;
        } 
    else if(operator == 1) {
            constrain value == threshold;
        }
    else if(operator == 2) {
            gt(value, threshold)
        } 
    else if(operator == 3) {
            lt(value, threshold)
        } 
    else if(operator == 4) {
        constrain inVal;
    }
    else if (operator == 5) {
        constrain outVal;
    }
    
}

// // // // Prove that values x is greater than y
fn gt(value : Field, threshold : Field) {
    let value = value as u96;
    let threshold = threshold as u96; 
    constrain value > threshold;
}
// // // // Prove that values x is less than y
fn lt(value : Field, threshold: Field) {
    let value = value as u96;
    let threshold = threshold as u96; 
     constrain value < threshold;
}